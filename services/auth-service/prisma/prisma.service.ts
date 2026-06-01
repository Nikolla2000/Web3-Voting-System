import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../src/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);

        super({ adapter });
    }


    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Successful connection to database.');
        } catch (error) {
            this.logger.error('Failed to connect to the database:', error);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}