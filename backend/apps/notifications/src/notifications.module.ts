import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig, { envValidationSchema } from './config/app.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { RabbitMQConsumerService } from './rabbitmq/rabbitmq-consumer.service';
import { WelcomeEmailModule } from './notifications/notifications.module';
import { RabbitMQConnectionService } from '@app/shared';
import emailConfig from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/notifications/.env',
      isGlobal: true,
      load: [appConfig, rabbitmqConfig, emailConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      }
    }),
    WelcomeEmailModule,
  ],
  controllers: [],
  providers: [RabbitMQConnectionService, RabbitMQConsumerService],
})
export class NotificationsModule {}
