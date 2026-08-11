import { IsEthereumAddress, IsString } from "class-validator";

export class LinkWalletDto {
  @IsEthereumAddress()
  address: string;

  @IsString()
  signature: string;

  @IsString()
  challengeToken: string;
}