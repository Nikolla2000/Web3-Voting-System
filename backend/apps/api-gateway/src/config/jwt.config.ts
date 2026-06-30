import { registerAs } from "@nestjs/config";
import * as Joi from 'joi';

export default registerAs('jwt', () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET,
}));

export const jwtEnvValidation  = {
  JWT_ACCESS_SECRET: Joi.string().required(),
}