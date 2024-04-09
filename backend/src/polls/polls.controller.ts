import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { PollsService } from './polls.service';
import { Poll } from './entities/poll.entity';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Get()
  findAll() {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pollsService.findOne(+id);
  }

  @Post()
  async create(@Body() pollData: Poll) {
    return this.pollsService.create(pollData);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise <Poll | null> {
    return this.pollsService.deletePoll(id);
  }

  @Put('vote1/:id') 
  async voteForOption1(@Param('id', ParseIntPipe) id: number): Promise <Poll | null> {
    return this.pollsService.voteForOption1(id);
  }

  @Put('vote2/:id')
  async voteForOption2(@Param('id', ParseIntPipe) id: number): Promise <Poll | null> {
    return this.pollsService.voteForOption2(id);
  }
}
