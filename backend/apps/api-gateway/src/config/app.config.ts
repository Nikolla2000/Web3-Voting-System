import { registerAs } from "@nestjs/config";
import * as Joi from 'joi';
import { servicesEnvValidation } from "./services.config";

export default registerAs('app', () => ({
    isDevelopment: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    frontendUrl: process.env.FRONTEND_URL
}));

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  FRONTEND_URL: Joi.string().required(),
//   ...jwtEnvValidation,
  ...servicesEnvValidation,
})