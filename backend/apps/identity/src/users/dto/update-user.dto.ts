import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// Password changes go through UsersService.changePassword(), which verifies
// the current password — not through this general profile-update path.
// Avatar is also excluded — it's only ever set via the presigned-upload +
// confirm flow, never a raw URL.
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'avatar'] as const),
) {}
