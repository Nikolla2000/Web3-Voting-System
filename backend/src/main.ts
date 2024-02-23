import { config } from 'dotenv';
config()

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  
  app.enableCors();
  
  await app.listen(port);
}

bootstrap();
