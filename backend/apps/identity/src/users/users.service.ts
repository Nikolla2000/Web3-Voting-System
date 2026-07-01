import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "apps/identity/prisma/prisma.service";
import { User } from "../generated/prisma/client";
import { SafeUser } from "./users.types";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()

export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    private sanitize(user: User): SafeUser {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    async create(dto: CreateUserDto): Promise<SafeUser> {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { username: dto.username },
                ],
            },
        });

        if (existing) {
            throw new ConflictException(
                existing.email === dto.email
                ? 'Email already in use'
                : 'Username is taken'
            );
        }

        const hashedPassword = dto.password
            ? await bcrypt.hash(dto.password, 12)
            : null;

        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
        });

        return this.sanitize(user);
    }

    async findById(id: string): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) throw new NotFoundException('User not found');

        return this.sanitize(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email }
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { username }
        });
    }

    async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) throw new NotFoundException('User not found');

        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 12);
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: dto
        });

        return this.sanitize(updated);
    }

    async deactivate(id: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id } });

        if (!user) throw new NotFoundException('User not found');

        await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        })
    }
}