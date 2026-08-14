import { Controller, Get } from '@nestjs/common';
import { PollsService } from './polls.service';

@Controller()
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  getHello(): string {
    return this.pollsService.getHello();
  }
}
