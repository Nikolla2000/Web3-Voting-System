import { IsString, MaxLength, MinLength } from 'class-validator';

export class CheckDuplicatePollDto {
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;
}
