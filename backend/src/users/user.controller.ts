import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { UserSevice } from "./user.service";
import { User } from "./user.model";

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserSevice) {}

  @Get()
  async getAllUsers(): Promise <User[]> {
    return this.userService.getAllUsers();
  }

  @Get(":id")
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.getUser(id);
  }

  @Post('/create')
  async createUser(@Body() userData: User): Promise <User> {
    return this.userService.createUser(userData);
  }
}