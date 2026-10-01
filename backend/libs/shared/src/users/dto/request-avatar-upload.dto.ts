import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { IMAGE_CONTENT_TYPES, IMAGE_MAX_SIZE_BYTES } from '@app/shared/storage/image-upload.constants';

export class RequestAvatarUploadDto {
  @ApiProperty({ enum: Object.keys(IMAGE_CONTENT_TYPES) })
  @IsIn(Object.keys(IMAGE_CONTENT_TYPES))
  contentType: string;

  @ApiProperty({ example: 123456, maximum: IMAGE_MAX_SIZE_BYTES })
  @IsInt()
  @Min(1)
  @Max(IMAGE_MAX_SIZE_BYTES)
  size: number;
}
