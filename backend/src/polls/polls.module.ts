import { Module } from '@nestjs/common';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { PrismaService } from 'src/prisma.service';
import { UserSevice } from 'src/users/user.service';

@Module({
  controllers: [PollsController],
  providers: [PollsService, PrismaService, UserSevice],
})
export class PollsModule {}
