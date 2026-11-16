import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsAfterProperty } from '../validators/is-after-property.validator';
import { IsAtLeastHoursFromNow } from '../validators/is-at-least-hours-from-now.validator';
import { IsNotInPast } from '../validators/is-not-in-past.validator';

export const MIN_POLL_END_LEAD_HOURS = 24;

/** How far in the past `startsAt` may be — mirrors the frontend's START_DATE_GRACE_MINUTES. */
export const START_DATE_GRACE_MINUTES = 15;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const trimEach = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value.map((item: unknown) =>
        typeof item === 'string' ? item.trim() : item,
      )
    : value;

/** Case-insensitive, so "Yes" and "yes" are one option. Runs after trimEach. */
const optionKey = (option: unknown) =>
  typeof option === 'string' ? option.toLowerCase() : option;

export enum PollCategoryDto {
  SPORTS = 'sports',
  TRAVEL = 'travel',
  ENTERTAINMENT = 'entertainment',
  LIFESTYLE = 'lifestyle',
  TECH_SCIENCE = 'tech_science',
  SOCIETY = 'society',
  FINANCE = 'finance',
  POLITICS = 'politics',
  EDUCATION = 'education',
  OTHER = 'other',
}

// Trimming happens in @Transform, before validation, so whitespace can't satisfy a minimum length
// and the trimmed values are what get forwarded to the polls service.
export class CreatePollDto {
  @Transform(trim)
  @IsString()
  @MinLength(5)
  @MaxLength(160)
  title: string;

  @Transform(trim)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @IsUrl()
  imageUrl: string;

  @IsEnum(PollCategoryDto)
  category: PollCategoryDto;

  @IsDateString()
  @IsNotInPast(START_DATE_GRACE_MINUTES)
  startsAt: string;

  @IsDateString()
  @IsAfterProperty('startsAt')
  @IsAtLeastHoursFromNow(MIN_POLL_END_LEAD_HOURS, {
    message: `endsAt must be at least ${MIN_POLL_END_LEAD_HOURS} hours from now`,
  })
  endsAt: string;

  @Transform(trimEach)
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @MinLength(1, { each: true, message: 'each option must not be empty' })
  @ArrayUnique(optionKey, { message: 'options must all be different' })
  options: string[];
}
