import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { PollsClientModule } from '../polls-client/polls-client.module';

@Module({
  imports: [PollsClientModule],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
