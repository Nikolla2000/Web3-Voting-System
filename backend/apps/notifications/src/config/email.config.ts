import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '', 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
}));

export const emailValidationSchema = {
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().default(587),
  EMAIL_SECURE: Joi.string().valid('true', 'false').default('false'),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
}