import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BlockchainProxyController } from './blockchain-proxy.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BLOCKCHAIN_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'blockchain',
          protoPath: join(
            process.cwd(),
            'libs/shared/src/blockchain/blockchain.proto',
          ),
          url: '127.0.0.1:3003',
        },
      },
    ]),
  ],
  controllers: [BlockchainProxyController],
})
export class BlockchainModule {}
