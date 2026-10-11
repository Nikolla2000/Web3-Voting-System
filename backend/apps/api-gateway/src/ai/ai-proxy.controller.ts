import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { CheckDuplicatePollDto, CheckPollNeutralityDto, SearchPollsDto } from '@app/shared';
import { Public } from '../auth/decorators/public.decorator';

interface AiServiceGrpc {
  checkDuplicatePoll(data: unknown): Observable<unknown>;
  searchPolls(data: unknown): Observable<unknown>;
  checkPollNeutrality(data: unknown): Observable<unknown>;
}

// Costs a real embedding-API call per request, same reasoning as the
// relayer-gas-cost throttling on poll creation/group join.
@ApiTags('AI')
@ApiBearerAuth()
@Controller('polls')
export class AiProxyController implements OnModuleInit {
  private aiService: AiServiceGrpc;

  constructor(@Inject('AI_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.aiService = this.client.getService<AiServiceGrpc>('AiService');
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('duplicate-check')
  @ApiOperation({
    summary: 'Check a draft poll title/description against existing polls for semantic similarity',
  })
  async checkDuplicatePoll(@Body() dto: CheckDuplicatePollDto) {
    return firstValueFrom(this.aiService.checkDuplicatePoll(dto));
  }

  // Public like the regular poll listing (GET /polls) -- this is a discovery
  // feature, not a privileged one -- but still throttled since, unlike that
  // Redis-cached listing, every call here is a real LLM + embedding spend.
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('search')
  @ApiOperation({
    summary: 'Search polls with a free-text natural-language query (semantic + date/category filters)',
  })
  async searchPolls(@Body() dto: SearchPollsDto) {
    return firstValueFrom(this.aiService.searchPolls(dto));
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('neutrality-check')
  @ApiOperation({
    summary: "Check a draft poll's title/options for neutral, non-leading framing",
  })
  async checkPollNeutrality(@Body() dto: CheckPollNeutralityDto) {
    return firstValueFrom(this.aiService.checkPollNeutrality(dto));
  }
}
