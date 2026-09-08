import { registerAs } from "@nestjs/config"
import * as Joi from 'joi';
import { jwtEnvValidation } from "./jwt.config";
import { rabbitmqEnvValidation } from "./rabbitmq.config";

export default registerAs('app', () => ({
    isDevelopment: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.IDENTITY_SERVICE_PORT || '3001', 10),
}));

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  IDENTITY_SERVICE_PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  ...jwtEnvValidation,
  ...rabbitmqEnvValidation
})