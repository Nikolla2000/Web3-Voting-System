import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AccountController, CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';
import { CatsModule } from './cats/cats.module';

const db_port = parseInt(process.env.DB_PORT);
const db_host = process.env.DB_HOST;
const db_name = process.env.DB_NAME;
const db_username = process.env.DB_USERNAME;
const db_pass = process.env.DB_PASS;

@Module({
  imports: [CatsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: db_host,
      port: db_port,
      username: db_username,
      password: db_pass,
      database: db_name,
      entities: [User],
      synchronize: true,
    })
  ],
  controllers: [AppController, AccountController],
  providers: [AppService,],
})
export class AppModule {}
