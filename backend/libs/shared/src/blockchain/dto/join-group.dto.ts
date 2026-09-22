import { IsNumberString } from 'class-validator';

export class JoinGroupDto {
  @IsNumberString()
  identityCommitment: string;
}
