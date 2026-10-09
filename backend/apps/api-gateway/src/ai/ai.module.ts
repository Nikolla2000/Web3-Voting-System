import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AiProxyController } from './ai-proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AI_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'ai',
          protoPath: join(process.cwd(), 'libs/shared/src/ai/ai.proto'),
          url: '127.0.0.1:3004',
        },
      },
    ]),
  ],
  controllers: [AiProxyController],
})
export class AiModule {}
