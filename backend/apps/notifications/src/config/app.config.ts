import { registerAs } from "@nestjs/config"
import * as Joi from 'joi';
import { rabbitmqEnvValidation } from "./rabbitmq.config";
import { emailValidationSchema } from "./email.config";

export default registerAs('app', () => ({
    port: parseInt(process.env.NOTIFICATIONS_SERVICE_PORT || '3002', 10),
}));

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  NOTIFICATIONS_SERVICE_PORT: Joi.number().port().default(3001),
  ...rabbitmqEnvValidation,
  ...emailValidationSchema
})