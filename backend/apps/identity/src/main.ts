import { NestFactory } from '@nestjs/core';
import { IdentityModule } from './identity.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001
      }
    }
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3001;
  const logger = new Logger('Bootstrap');

  await app.listen();
  logger.log(`Identity service is listening on port ${port}`);
}
bootstrap();
