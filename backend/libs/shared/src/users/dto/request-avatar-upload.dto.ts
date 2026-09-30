import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { AVATAR_CONTENT_TYPES, AVATAR_MAX_SIZE_BYTES } from '@app/shared/storage/avatar-storage.constants';

export class RequestAvatarUploadDto {
  @ApiProperty({ enum: Object.keys(AVATAR_CONTENT_TYPES) })
  @IsIn(Object.keys(AVATAR_CONTENT_TYPES))
  contentType: string;

  @ApiProperty({ example: 123456, maximum: AVATAR_MAX_SIZE_BYTES })
  @IsInt()
  @Min(1)
  @Max(AVATAR_MAX_SIZE_BYTES)
  size: number;
}
