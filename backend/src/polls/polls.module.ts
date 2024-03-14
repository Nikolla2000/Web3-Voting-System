import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PollsController],
  providers: [PollsService, PrismaService],
})
export class PollsModule {}
