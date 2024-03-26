import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { PollsModule } from './polls/polls.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UserModule,
    PollsModule,
    AuthModule,
  ],
  controllers: [AppController,],
  providers: [AppService,],
})
export class AppModule {}
