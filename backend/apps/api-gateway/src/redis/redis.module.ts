import { Module } from '@nestjs/common';
import { RedisService } from '@app/shared';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
