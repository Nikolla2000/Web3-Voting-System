import { registerAs } from "@nestjs/config";
import * as Joi from 'joi';

export default registerAs('app', () => ({
  isDevelopment: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  frontendUrl: process.env.FRONTEND_URL
}));

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  FRONTEND_URL: Joi.string().required(),
  // DB_HOST: Joi.string().required(),
  // DB_NAME: Joi.string().required(),
  // DB_IMAGE_NAME: Joi.string().required(),
  // DB_CONTAINER_PORT: Joi.number().required(),
  // DB_USER: Joi.string().required(),
  // DB_PASSWORD: Joi.string().required(),
})