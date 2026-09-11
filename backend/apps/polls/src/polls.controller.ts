import { Controller, Get } from '@nestjs/common';
import { PollsService } from './polls.service';
import { GrpcMethod } from '@nestjs/microservices';
import type { FindManyInput } from './polls.service';

@Controller()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @GrpcMethod('PollsService', 'CreatePoll')
  createPoll(data: {
    creatorId: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    startsAt: string;
    endsAt: string;
    options: string[];
  }) {
    return this.pollsService.create(data);
  }

  @GrpcMethod('PollsService', 'GetPolls')
  getPolls(data: FindManyInput) {
    return this.pollsService.findMany(data);
  }

  @GrpcMethod('PollsService', 'GetPollById')
  getPollById(data: { id: string }) {
    return this.pollsService.findById(data.id);
  }
}
