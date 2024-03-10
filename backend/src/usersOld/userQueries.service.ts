import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersQueryService {
  constructor(private dataSource: DataSource) {}

  async createMany(users: User[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(users[0])
      await queryRunner.manager.save(users[1]);

      await queryRunner.commitTransaction();

    } catch (error) {
      await queryRunner.rollbackTransaction();
    }
    finally {
      await queryRunner.release();
    }
  }
}