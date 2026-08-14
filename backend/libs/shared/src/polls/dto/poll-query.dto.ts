import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PollStatusFilter {
  ALL = 'all',
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

export enum PollSortBy {
  NEWEST = 'newest',
  ENDING_SOON = 'endingSoon',
  MOST_VOTES = 'mostVotes',
  ALPHABETICAL = 'alphabetical',
}

export class PollQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PollStatusFilter)
  status?: PollStatusFilter = PollStatusFilter.ALL;

  @IsOptional()
  @IsEnum(PollSortBy)
  sortBy?: PollSortBy = PollSortBy.NEWEST;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;
}