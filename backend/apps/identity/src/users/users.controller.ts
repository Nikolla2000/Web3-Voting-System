import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "../generated/prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { UserPayload } from "./users.types";
import { UpdateUserDto } from "./dto/update-user.dto";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { USERS_PATTERNS } from "@app/shared";

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // @Get('me')
    // @ApiOperation({ summary: 'Get current authenticated user' })
    // @ApiResponse({ status: 200, description: 'Returns current user' })
    // async getMe(@CurrentUser() user: UserPayload) {
    //     return this.usersService.findById(user.id);
    // }

    // @Get(':id')
    // @ApiOperation({ summary: 'Get user by ID' })
    // @ApiResponse({ status: 200, description: 'Returns user' })
    // @ApiResponse({ status: 404, description: 'User not found' })
    // async findOne(@Param('id') id: string) {
    //     return this.usersService.findById(id);
    // }

    // @Patch('me')
    // @ApiOperation({ summary: 'Update current user profile' })
    // updateMe(
    //     @CurrentUser() user: UserPayload,
    //     @Body() dto: UpdateUserDto
    // ) {
    //     return this.usersService.update(user.id, dto);
    // }
    @MessagePattern({ cmd: USERS_PATTERNS.GET_ME })
    async getMe(@Payload() payload: { userId: string }) {
      return { message: 'aaa' };
      // return this.usersService.findById(payload.userId);
    }

}