import { config } from 'dotenv';
config()

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  
  app.enableCors({
    // origin: 'http://localhost:3000/', //local origin
    origin: 'https://web3-voting-system-mu.vercel.app/', //production url origin
  });
  
  await app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

bootstrap();
