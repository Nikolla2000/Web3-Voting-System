import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserSevice } from "./user.service";
import { PrismaService } from "src/prisma.service";

@Module({
  // imports: [],
  controllers: [UserController],
  providers: [UserSevice, PrismaService]
})
export class UserModule {}