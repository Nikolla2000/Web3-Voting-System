import { NestFactory } from '@nestjs/core';
import { BlockchainModule } from './blockchain.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BlockchainModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'blockchain',
        protoPath: join(
          process.cwd(),
          'libs/shared/src/blockchain/blockchain.proto',
        ),
        url: '0.0.0.0:3003',
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen();

  const logger = new Logger('Bootstrap');
  logger.log('Blockchain microservice listening on 0.0.0.0:3003 (gRPC)');
}
bootstrap();
