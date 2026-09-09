import { registerAs } from "@nestjs/config"
import * as Joi from 'joi';
import { rabbitmqEnvValidation } from "./rabbitmq.config";

export default registerAs('app', () => ({
    isProduction: process.env.NODE_ENV === 'production',
    port: parseInt(process.env.POLLS_SERVICE_PORT || '3002', 10)
}));

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    POLLS_SERVICE_PORT: Joi.number().port().default(3002),
    DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
    rabbitmqEnvValidation,
});