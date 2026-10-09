import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import appConfig, { envValidationSchema } from './config/app.config';
import jwtConfig from './config/jwt.config';
import servicesConfig from './config/services.config';
import r2Config from './config/r2.config';
import googleConfig from './config/google.config';
import redisConfig from '@app/shared/redis/redis.config';
import { RedisService } from '@app/shared';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { PollsModule } from './polls/polls.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AiModule } from './ai/ai.module';
import { RedisModule } from './redis/redis.module';
import { RedisThrottlerStorage } from './throttler/redis-throttler-storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, servicesConfig, r2Config, googleConfig, redisConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUknown: true,
        abortEarly: true,
      }
    }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
        storage: new RedisThrottlerStorage(redisService),
      }),
    }),
    AuthModule,
    PollsModule,
    BlockchainModule,
    AiModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
