import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export enum PollCategoryDto {
  GOVERNANCE = 'governance',
  TREASURY = 'treasury',
  TECHNICAL = 'technical',
  COMMUNITY = 'community',
}

export class CreatePollDto {
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsUrl()
  imageUrl: string;

  @IsEnum(PollCategoryDto)
  category: PollCategoryDto;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];
}