import { NestFactory } from '@nestjs/core';
import { IdentityModule } from './identity.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const port = parseInt(process.env.IDENTITY_SERVICE_PORT || '3001', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IdentityModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );
  const logger = new Logger('Bootstrap');

  await app.listen();
  logger.log(`Identity service is listening on port ${port}`);
}
bootstrap();
