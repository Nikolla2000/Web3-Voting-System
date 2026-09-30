import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('r2', () => ({
  bucket: process.env.R2_BUCKET_NAME,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  publicUrl: process.env.R2_PUBLIC_URL,
}));

export const r2EnvValidation = {
  R2_BUCKET_NAME: Joi.string().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_ENDPOINT: Joi.string().uri().required(),
  R2_PUBLIC_URL: Joi.string().uri().required(),
};
