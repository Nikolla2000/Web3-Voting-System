import { Controller, Get } from "@nestjs/common";
import { UserSevice } from "./user.service";
import { User } from "./user.model";

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserSevice) {}

  @Get()
  async getAllUsers(): Promise <User[]> {
    return this.userService.getAllUsers()
  }
}