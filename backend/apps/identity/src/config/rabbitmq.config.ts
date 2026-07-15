import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
 
export default registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL,
}));
 
export const rabbitmqEnvValidation = {
  RABBITMQ_URL: Joi.string().uri().required(),
};
 