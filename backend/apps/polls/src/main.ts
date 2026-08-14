import { NestFactory } from '@nestjs/core';
import { PollsModule } from './polls.module';

async function bootstrap() {
  const app = await NestFactory.create(PollsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
