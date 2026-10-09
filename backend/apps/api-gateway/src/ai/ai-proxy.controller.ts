import { Body, Controller, Inject, OnModuleInit, Post } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { CheckDuplicatePollDto } from '@app/shared';

interface AiServiceGrpc {
  checkDuplicatePoll(data: unknown): Observable<unknown>;
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
}
