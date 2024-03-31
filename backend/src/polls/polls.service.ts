import { BadRequestException, Injectable } from '@nestjs/common';
import { Poll } from './entities/poll.entity';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PollsService {
  constructor (private prisma: PrismaService) {}
  
  findAll(): Promise<Poll[]> {
    return this.prisma.poll.findMany();
  }

  findOne(id: number): Promise <Poll | null> {
    return this.prisma.poll.findUnique({ where: {id:Number(id)} });
  }

  async create(data: Poll): Promise<Poll> {
    try {
      return await this.prisma.poll.create({ data })
    } catch (error) {
      throw new BadRequestException('Could not create Poll')
    }
  }

  async deletePoll(id: number): Promise<Poll | null> {
    return await this.prisma.poll.delete({
      where: {
        id:Number (id)
      }
    })
  }
}
