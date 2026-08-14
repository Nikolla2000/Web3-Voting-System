import { NestFactory } from '@nestjs/core';
import { PollsModule } from './polls.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PollsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'polls',
        protoPath: join(process.cwd(), 'libs/shared/src/polls/polls.proto'),
        url: '0.0.0.0:3002'
      }
    }
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();

  const logger = new Logger('Bootstrap');
  logger.log('Polls microservice listening on 0.0.0.0:3002 (gRPC)');
}
bootstrap();
