import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { UserSevice } from "./user.service";
import { User } from "./user.model";
import { JwtGuard } from "src/auth/guards/jwt.guard";

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserSevice) {}

  @Get()
  async getAllUsers(): Promise <User[]> {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtGuard)
  @Get(":id")
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Post('/register')
  async createUser(@Body() userData: User): Promise <User> {
    return this.userService.createUser(userData);
  }

  @Get('/hasVoted/:userId/:pollId')
  async hasUserVoted(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('pollId', ParseIntPipe) pollId: number,
  ) : Promise<boolean> {
    return await this.userService.hasUserVoted(userId, pollId);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe)id: number): Promise<User | null> {
    return this.userService.deleteUser(id);
  }
}