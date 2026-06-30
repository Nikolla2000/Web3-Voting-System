import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = async (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('API Gateway')
        .setDescription('The API Gateway for the Web3 Voting System')
        .setVersion('1.0')
        .addBearerAuth()
        .build()

    const customOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            docExpansion: 'none',
            persistAuthorization: true,
            displayOperationId: true,
            operationsSorter: 'method',
            tagsSorter: 'alpha',
            tryItOutEnabled: true,
            filter: true,
        },
    };

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        explorer: true,
        ...customOptions,
    });
}