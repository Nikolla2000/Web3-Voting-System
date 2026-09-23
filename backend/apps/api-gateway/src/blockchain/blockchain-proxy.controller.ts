import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, Observable } from 'rxjs';
import { JoinGroupDto, SubmitVoteDto } from '@app/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

interface BlockchainServiceGrpc {
  joinGroup(data: unknown): Observable<unknown>;
  getMerkleProof(data: unknown): Observable<unknown>;
  verifyVoteProof(data: unknown): Observable<unknown>;
  submitVote(data: unknown): Observable<unknown>;
}

// Every route here requires a logged-in platform user (the global JwtAuthGuard
// applies — no @Public()). JoinGroup forwards that user's id to blockchain,
// which gates group admission to one commitment per (pollId, userId) — see
// GroupMember in apps/blockchain/prisma/schema.prisma for the privacy
// trade-off that gate implies.
@ApiTags('Voting')
@ApiBearerAuth()
@Controller('polls')
export class BlockchainProxyController implements OnModuleInit {
  private blockchainService: BlockchainServiceGrpc;

  constructor(
    @Inject('BLOCKCHAIN_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.blockchainService =
      this.client.getService<BlockchainServiceGrpc>('BlockchainService');
  }

  @Post(':id/group/join')
  @ApiOperation({
    summary:
      "Join this poll's Semaphore group with a client-generated identity commitment",
  })
  async joinGroup(
    @Param('id') pollId: string,
    @Body() dto: JoinGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return firstValueFrom(
      this.blockchainService.joinGroup({
        pollId,
        identityCommitment: dto.identityCommitment,
        userId: user.sub,
      }),
    );
  }

  @Get(':id/group/merkle-proof')
  @ApiOperation({
    summary:
      "Get the Merkle proof needed to build a Semaphore proof for this poll's group",
  })
  async getMerkleProof(
    @Param('id') pollId: string,
    @Query('identityCommitment') identityCommitment: string,
  ) {
    return firstValueFrom(
      this.blockchainService.getMerkleProof({ pollId, identityCommitment }),
    );
  }

  @Post(':id/vote/verify')
  @ApiOperation({
    summary:
      'Dry-run verify a Semaphore vote proof with no on-chain side effect',
  })
  async verifyVoteProof(
    @Param('id') pollId: string,
    @Body() dto: SubmitVoteDto,
  ) {
    return firstValueFrom(
      this.blockchainService.verifyVoteProof({ pollId, ...dto }),
    );
  }

  @Post(':id/vote')
  @ApiOperation({
    summary:
      "Submit a Semaphore vote proof — relayed on-chain from the service's own account",
  })
  async submitVote(@Param('id') pollId: string, @Body() dto: SubmitVoteDto) {
    return firstValueFrom(
      this.blockchainService.submitVote({ pollId, ...dto }),
    );
  }
}
