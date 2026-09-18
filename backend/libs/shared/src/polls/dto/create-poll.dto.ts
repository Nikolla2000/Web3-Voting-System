import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsAtLeastHoursFromNow } from '../validators/is-at-least-hours-from-now.validator';

export const MIN_POLL_END_LEAD_HOURS = 24;

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
  @IsAtLeastHoursFromNow(MIN_POLL_END_LEAD_HOURS, {
    message: `endsAt must be at least ${MIN_POLL_END_LEAD_HOURS} hours from now`,
  })
  endsAt: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];
}
