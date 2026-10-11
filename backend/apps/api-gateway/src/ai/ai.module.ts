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
          // Without this, proto3's wire format omits default-valued fields
          // entirely (false, 0, "", []) -- CheckPollNeutralityResponse's
          // `isNeutral: false` and every empty `issues`/`matches`/`results`
          // array would silently vanish from the response instead of
          // coming through as their zero value.
          loader: { defaults: true },
        },
      },
    ]),
  ],
  controllers: [AiProxyController],
})
export class AiModule {}
