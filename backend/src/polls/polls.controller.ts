import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PollsService } from './polls.service';
import { Poll } from './entities/poll.entity';

@Controller('polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) {}

  @Post()
  create(@Body() pollData: Poll) {
    return this.pollsService.create(pollData);
  }

  @Get()
  findAll() {
    return this.pollsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pollsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
  //   return this.pollsService.update(+id, updatePollDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollsService.remove(+id);
  }
}
