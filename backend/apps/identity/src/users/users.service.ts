import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "apps/identity/prisma/prisma.service";
import { User } from "../generated/prisma/client";
import { SafeUser } from "./users.types";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dto/update-user.dto";
import { randomBytes } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { LinkWalletDto, RpcConflictException, RpcUnauthorizedException } from "@app/shared";
import { verifyMessage } from 'viem';

@Injectable()

export class UsersService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService
    ) {}

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

  async createWalletChallenge(userId: string): Promise<{ message: string; challengeToken: string }> {
    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();

    const message = [
      'Sign this message to link your wallet to VoteChain.',
      '',
      `User: ${userId}`,
      `Nonce: ${nonce}`,
      `Issued At: ${issuedAt}`,
    ].join('\n');

    const challengeToken = this.jwtService.sign(
      { sub: userId, message },
      { expiresIn: '5m' },
    );

    return { message, challengeToken };
  }

  async linkWallet(userId: string, dto: LinkWalletDto): Promise<SafeUser> {
    let payload: { sub: string; message: string };
    try {
      payload = this.jwtService.verify(dto.challengeToken);
    } catch {
      throw new RpcUnauthorizedException('Wallet challenge expired or invalid');
    }

    if (payload.sub !== userId) {
      throw new RpcUnauthorizedException('Wallet challenge does not belong to this user');
    }

    const isValid = await verifyMessage({
      address: dto.address as `0x${string}`,
      message: payload.message,
      signature: dto.signature as `0x${string}`,
    });

    if (!isValid) {
      throw new RpcUnauthorizedException('Signature verification failed');
    }

    const existing = await this.prisma.user.findUnique({
      where: { walletAddress: dto.address },
    });

    if (existing && existing.id !== userId) {
      throw new RpcConflictException('This wallet is already linked to another account');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { walletAddress: dto.address },
    });

    return this.sanitize(updated);
  }

}