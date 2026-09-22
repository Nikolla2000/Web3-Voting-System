import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumberString,
  Min,
} from 'class-validator';

/**
 * Mirrors @semaphore-protocol/proof's SemaphoreProof shape (see
 * blockchain.proto) — this is what generateProof() on the client returns,
 * passed straight through. pollId isn't here: it comes from the route,
 * and blockchain checks it against the proof's own `scope` field instead
 * of trusting a client-supplied one.
 */
export class SubmitVoteDto {
  @IsInt()
  @Min(1)
  merkleTreeDepth: number;

  @IsNumberString()
  merkleTreeRoot: string;

  @IsNumberString()
  nullifier: string;

  @IsNumberString()
  message: string;

  @IsNumberString()
  scope: string;

  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  @IsNumberString({}, { each: true })
  points: string[];
}
