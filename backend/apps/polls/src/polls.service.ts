import { Injectable } from '@nestjs/common';

@Injectable()
export class PollsService {
  getHello(): string {
    return 'Hello World!';
  }
}
