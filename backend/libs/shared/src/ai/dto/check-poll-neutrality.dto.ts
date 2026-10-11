import { ArrayMinSize, IsArray, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckPollNeutralityDto {
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];
}
