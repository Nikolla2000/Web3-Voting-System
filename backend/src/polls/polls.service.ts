import { BadRequestException, Injectable } from '@nestjs/common';
import { Poll } from './entities/poll.entity';
import { PrismaService } from 'src/prisma.service';
import { UserSevice } from 'src/users/user.service';

@Injectable()
export class PollsService {
  constructor (
    private prisma: PrismaService,
    private userService: UserSevice
    ) {}
  
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

  async voteForOption1(id: number, userId: number): Promise<Poll> {
    return this.addVote(id, 'votes1', userId);
  }
  
  async voteForOption2(id: number, userId: number): Promise<Poll> {
    return this.addVote(id, 'votes2', userId);
  }

  private async addVote(id: number, option: 'votes1' | 'votes2', userId: number): Promise<Poll | null> {
    const poll = await this.findOne(id);

    if(!poll) {
      throw new BadRequestException('Poll was not found');
    }

    const hasUserVoted = await this.userService.hasUserVoted(userId, poll.id);

    if (hasUserVoted) {
      throw new BadRequestException('User has already voted for this poll');
    }

    try {
      const dataToUpdate = { 
        [option]: { increment: 1 },
        users: { connect: {id: userId } }
      };
      const votedPoll = await this.prisma.poll.update({
        where: { id },
        data: dataToUpdate,
      })

      return votedPoll;

    } catch (error) {
      throw new BadRequestException('Could not vote')
    }
  }
}
