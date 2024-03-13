import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./user.controller";
import { UserSubscriber } from "./user.subscriber";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UsersService, UserSubscriber],
    controllers: [UsersController],
})

export class UsersModule {}