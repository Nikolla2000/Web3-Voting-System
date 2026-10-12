import { Body, Controller, Inject, OnModuleInit, Post, Res } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import type { Response } from 'express';
import { ChatDto, CheckDuplicatePollDto, CheckPollNeutralityDto, SearchPollsDto } from '@app/shared';
import { Public } from '../auth/decorators/public.decorator';

interface ChatChunk {
  textDelta: string;
}

interface AiServiceGrpc {
  checkDuplicatePoll(data: unknown): Observable<unknown>;
  searchPolls(data: unknown): Observable<unknown>;
  checkPollNeutrality(data: unknown): Observable<unknown>;
  chat(data: unknown): Observable<ChatChunk>;
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

  // SSE over plain HTTP, adapted here from the gRPC server-streaming call --
  // the gateway's usual protocol-translation job, just with a streaming RPC
  // instead of a unary one. POST (not the EventSource-friendly GET) since a
  // multi-turn conversation history doesn't fit a query string; the frontend
  // reads the stream via fetch()+ReadableStream instead of EventSource.
  // Stricter throttle than the other AI endpoints: each message can trigger
  // several tool-calling rounds, so it's the most expensive call per request.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('chat')
  @ApiOperation({ summary: 'Ask a natural-language question about poll data (streamed response)' })
  async chat(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await new Promise<void>((resolve) => {
      this.aiService.chat(dto).subscribe({
        next: (chunk) => {
          res.write(`data: ${JSON.stringify({ textDelta: chunk.textDelta })}\n\n`);
        },
        error: () => {
          res.write(`data: ${JSON.stringify({ error: 'The assistant hit an error.' })}\n\n`);
          res.end();
          resolve();
        },
        complete: () => {
          res.write('event: done\ndata: {}\n\n');
          res.end();
          resolve();
        },
      });
    });
  }
}
