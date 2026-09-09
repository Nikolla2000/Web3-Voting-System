import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PollsProxyController } from './polls-proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POLLS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'polls',
          protoPath: join(process.cwd(), 'libs/shared/src/polls/polls.proto'),
          url: '127.0.0.1:3002',
        },
      },
    ]),
  ],
  controllers: [PollsProxyController],
})
export class PollsModule {}