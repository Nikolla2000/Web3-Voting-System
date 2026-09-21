import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { rabbitmqEnvValidation } from './rabbitmq.config';

export default registerAs('app', () => ({
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.BLOCKCHAIN_SERVICE_PORT || '3003', 10),
}));

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  BLOCKCHAIN_SERVICE_PORT: Joi.number().port().default(3003),
  // Sepolia RPC endpoint for the viem client (step 3).
  RPC_URL: Joi.string().uri().required(),
  ...rabbitmqEnvValidation,
});
