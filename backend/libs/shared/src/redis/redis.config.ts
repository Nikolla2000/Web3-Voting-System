import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
}));

export const redisEnvValidation = {
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
};
