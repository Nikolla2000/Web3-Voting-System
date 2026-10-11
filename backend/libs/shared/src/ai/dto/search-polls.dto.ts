import { IsString, MaxLength, MinLength } from 'class-validator';

export class SearchPollsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  query: string;
}
