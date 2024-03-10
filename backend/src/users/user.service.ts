import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserSevice {

  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise <User[]> {
    return this.prisma.user.findMany();
  }

  async getUser(id:number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: {id:Number(id)}})
  }
}