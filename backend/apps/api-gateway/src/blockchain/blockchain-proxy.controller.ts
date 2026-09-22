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

interface BlockchainServiceGrpc {
  joinGroup(data: unknown): Observable<unknown>;
  getMerkleProof(data: unknown): Observable<unknown>;
  verifyVoteProof(data: unknown): Observable<unknown>;
  submitVote(data: unknown): Observable<unknown>;
}

// Every route here requires a logged-in platform user (the global JwtAuthGuard
// applies — no @Public()), but that's account-level access control, not
// Sybil-resistance for the ZK layer: nothing here yet stops one logged-in
// user from generating many identity commitments and joining a poll's group
// more than once. walletAddress was the interim Sybil mechanism (see
// CLAUDE.md); a real fix — e.g. gating JoinGroup to one commitment per
// (userId, pollId) — is still open.
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
  async joinGroup(@Param('id') pollId: string, @Body() dto: JoinGroupDto) {
    return firstValueFrom(
      this.blockchainService.joinGroup({
        pollId,
        identityCommitment: dto.identityCommitment,
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
