import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSevice } from 'src/users/user.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserSevice, PrismaService]
})
export class AuthModule {}
