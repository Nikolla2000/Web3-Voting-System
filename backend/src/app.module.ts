import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './cats/cats.controller';
import { CatsModule } from './cats/cats.module';
import { UserModule } from './users/user.module';
import { PollsModule } from './polls/polls.module';

// const db_port = parseInt(process.env.DB_PORT);
// const db_host = process.env.DB_HOST;
// const db_name = process.env.DB_NAME;
// const db_username = process.env.DB_USERNAME;
// const db_pass = process.env.DB_PASS;

@Module({
  imports: [CatsModule,
    UserModule,
    PollsModule,
    // UsersModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: db_host,
    //   port: db_port,
    //   username: db_username,
    //   password: db_pass,
    //   database: db_name,
    //   entities: [User],
    //   autoLoadEntities: true,
    //   synchronize: false,
    //   ssl: {
    //     rejectUnauthorized: false,
    //     // ca: '/C:/Users/Nikola Uzunov/AppData/Roaming/postgresql/root.crt'
    //   }
    // })
  ],
  controllers: [AppController, AccountController],
  providers: [AppService,],
})
export class AppModule {}
