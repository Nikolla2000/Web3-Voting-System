import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { CreateUserDto } from "./dto/user.dto";

@Injectable()
export class UserSevice {

  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise <User[]> {
    return this.prisma.user.findMany();
  }

  async getUser(id:number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: {id:Number(id)}})
  }

  // async createUser(data: Prisma.UserCreateInput): Promise<User> {
  //   try {
  //     return await this.prisma.user.create({ data })
  //   } catch (error) {
  //     throw new BadRequestException('Could not create user')
  //   }
  // }

  async createTestTwo(dto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      }
    });

    if(user) throw new ConflictException("email already exists")

    const newUser = await this.prisma.user.create({
      data: {
        ...dto
      }
    })
    return newUser;
  }
}