import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ClientGrpc } from '@nestjs/microservices';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreatePollDto, PollQueryDto, R2StorageService } from '@app/shared';
import {
  IMAGE_CONTENT_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  POLL_IMAGE_PENDING_PREFIX,
  POLL_IMAGE_PREFIX,
  buildObjectKey,
} from '@app/shared/storage/image-upload.constants';

// The file part of a key buildObjectKey produced: a UUID and an allowed extension. Matching it
// exactly (rather than a prefix) is what stops a crafted imageUrl like ".../pending/<me>/../x"
// from making the gateway copy, then delete, an object that isn't a pending cover image.
const UPLOADED_FILE_NAME = new RegExp(
  String.raw`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(${Object.values(IMAGE_CONTENT_TYPES).join('|')})$`,
);

interface PollsServiceGrpc {
  createPoll(data: unknown): Observable<unknown>;
  getPolls(data: unknown): Observable<unknown>;
  getPollById(data: { id: string }): Observable<unknown>;
}

@ApiTags('Polls')
@Controller('polls')
export class PollsProxyController implements OnModuleInit {
  private pollsService: PollsServiceGrpc;

  constructor(
    @Inject('POLLS_SERVICE') private readonly client: ClientGrpc,
    private readonly r2: R2StorageService,
  ) {}

  onModuleInit() {
    this.pollsService =
      this.client.getService<PollsServiceGrpc>('PollsService');
  }

  // Already behind the Redis cache-aside layer (polls.service.ts) and
  // exercised by legitimate high-frequency traffic (the poll detail page's
  // 15s active-poll refetch) — gateway-level throttling here would fight
  // that caching rather than complement it.
  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({
    summary: 'List polls (search, status filter, sort, pagination)',
  })
  async getPolls(@Query() query: PollQueryDto) {
    return firstValueFrom(this.pollsService.getPolls(query));
  }

  @Public()
  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single poll by id' })
  async getPollById(@Param('id') id: string) {
    return firstValueFrom(this.pollsService.getPollById({ id }));
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new poll (authenticated users only)' })
  async createPoll(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePollDto,
  ) {
    // The cover must be this user's own pending upload from POST /polls/images. It's promoted to
    // its permanent key only now that the poll is really being created; see image-upload.constants.
    const pendingPrefix = `${POLL_IMAGE_PENDING_PREFIX}/${user.sub}/`;
    const pendingKey = this.r2.keyFromPublicUrl(dto.imageUrl);
    const fileName = pendingKey?.startsWith(pendingPrefix)
      ? pendingKey.slice(pendingPrefix.length)
      : null;
    if (!pendingKey || !fileName || !UPLOADED_FILE_NAME.test(fileName)) {
      throw new BadRequestException(
        'imageUrl must be an image uploaded through POST /polls/images',
      );
    }

    const finalKey = `${POLL_IMAGE_PREFIX}/${user.sub}/${fileName}`;
    try {
      await this.r2.copyObject(pendingKey, finalKey);
    } catch (err) {
      if (err instanceof Error && err.name === 'NoSuchKey') {
        throw new BadRequestException(
          'The uploaded image has expired. Please choose it again.',
        );
      }
      throw err;
    }

    let poll: unknown;
    try {
      poll = await firstValueFrom(
        this.pollsService.createPoll({
          ...dto,
          imageUrl: this.r2.getPublicUrl(finalKey),
          creatorId: user.sub,
        }),
      );
    } catch (err) {
      // No poll, so no one will ever reference the copy. The pending original stays: the client
      // may retry with the same imageUrl, and the lifecycle rule removes it if it doesn't.
      await this.r2.deleteObject(finalKey);
      throw err;
    }

    // Best effort: if this fails, the lifecycle rule deletes it anyway.
    await this.r2.deleteObject(pendingKey);
    return poll;
  }

  // Server-mediated (not presigned) on purpose: a poll doesn't exist yet while
  // its create form is open, so there's no entity to scope/attach an eager
  // direct-to-bucket upload to. The image lands under the pending prefix and
  // only becomes permanent when POST /polls creates the poll with it.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload a poll cover image, returns its public URL',
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: IMAGE_MAX_SIZE_BYTES } }),
  )
  async uploadPollImage(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!IMAGE_CONTENT_TYPES[file.mimetype]) {
      throw new BadRequestException('Unsupported image type');
    }

    const key = buildObjectKey(
      `${POLL_IMAGE_PENDING_PREFIX}/${user.sub}`,
      file.mimetype,
    );
    const url = await this.r2.uploadObject(key, file.buffer, file.mimetype);

    return { url };
  }
}
