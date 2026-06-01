import { registerAs } from "@nestjs/config";

export default registerAs('app', () => ({
    isDevelopment: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.port, 10) || 3001,
    frontendUrl: process.env.FRONTEND_URL,
    gatewayUrl: process.env.GATEWAY_URL,
}));