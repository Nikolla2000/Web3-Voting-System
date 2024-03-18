import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserSevice } from "./user.service";
import { PrismaService } from "src/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  // imports: [],
  controllers: [UserController],
  providers: [UserSevice, PrismaService, JwtService]
})
export class UserModule {}