import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
 
export default registerAs('services', () => ({
  authUrl: process.env.AUTH_SERVICE_URL,
}));
 
export const servicesEnvValidation = {
  AUTH_SERVICE_URL: Joi.string().uri().required(),
};