import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
 
export default registerAs('services', () => ({
  identityUrl: process.env.IDENTITY_SERVICE_URL,
}));
 
export const servicesEnvValidation = {
  IDENTITY_SERVICE_URL: Joi.string().uri().required(),
};