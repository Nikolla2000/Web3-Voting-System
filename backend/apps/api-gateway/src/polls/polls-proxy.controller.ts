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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreatePollDto, PollQueryDto, R2StorageService } from '@app/shared';
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_SIZE_BYTES, buildObjectKey } from '@app/shared/storage/image-upload.constants';

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
    this.pollsService = this.client.getService<PollsServiceGrpc>('PollsService');
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List polls (search, status filter, sort, pagination)' })
  async getPolls(@Query() query: PollQueryDto) {
    return firstValueFrom(this.pollsService.getPolls(query));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single poll by id' })
  async getPollById(@Param('id') id: string) {
    return firstValueFrom(this.pollsService.getPollById({ id }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new poll (authenticated users only)' })
  async createPoll(@CurrentUser() user: JwtPayload, @Body() dto: CreatePollDto) {
    return firstValueFrom(this.pollsService.createPoll({ ...dto, creatorId: user.sub }));
  }

  // Server-mediated (not presigned) on purpose: a poll doesn't exist yet while
  // its create form is open, so there's no entity to scope/attach an eager
  // direct-to-bucket upload to. Uploading through the gateway at submit time
  // means nothing lands in R2 until the poll is actually being created.
  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a poll cover image, returns its public URL' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: IMAGE_MAX_SIZE_BYTES } }))
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

    const key = buildObjectKey(`polls/${user.sub}`, file.mimetype);
    const url = await this.r2.uploadObject(key, file.buffer, file.mimetype);

    return { url };
  }
}