import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class ChatTurnDto {
  @IsIn(['user', 'model'])
  role: 'user' | 'model';

  @IsString()
  @MaxLength(2000)
  content: string;
}

export class ChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history: ChatTurnDto[];
}
