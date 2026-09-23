import { Module } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';
import { ContractModule } from '../contract/contract.module';

@Module({
  imports: [ContractModule],
  providers: [SemaphoreService],
  exports: [SemaphoreService],
})
export class SemaphoreModule {}
