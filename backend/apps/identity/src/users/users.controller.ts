import { Controller} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { USERS_PATTERNS } from "@app/shared";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: USERS_PATTERNS.GET_ME })
    async getMe(@Payload() payload: { userId: string }) {
    return this.usersService.findById(payload.userId);
  }

  @MessagePattern({ cmd: USERS_PATTERNS.FIND_BY_ID })
  async findById(@Payload() payload: { userId: string }) {
    return this.usersService.findById(payload.userId);
  }
 
  @MessagePattern({ cmd: USERS_PATTERNS.UPDATE_ME })
  async updateMe(@Payload() payload: { userId: string; dto: UpdateUserDto }) {
    return this.usersService.update(payload.userId, payload.dto);
  }
}