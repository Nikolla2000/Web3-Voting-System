import { Body, Controller, Get, HttpCode, HttpStatus, Inject, OnModuleInit, Param, Post, Query } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreatePollDto, PollQueryDto } from '@app/shared';

interface PollsServiceGrpc {
  createPoll(data: unknown): Observable<unknown>;
  getPolls(data: unknown): Observable<unknown>;
  getPollById(data: { id: string }): Observable<unknown>;
}

@ApiTags('Polls')
@Controller('polls')
export class PollsProxyController implements OnModuleInit {
  private pollsService: PollsServiceGrpc;

  constructor(@Inject('POLLS_SERVICE') private readonly client: ClientGrpc) {}

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
}