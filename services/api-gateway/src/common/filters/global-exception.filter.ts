import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "src/types";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const { status, body } = this.extractErrorDetails(exception, request);

        this.logError(exception, request, status);

        response.status(status).json(body);
    }

    private extractErrorDetails(
        exception: unknown,
        request: Request
    ) : { status: number, body: ErrorResponse } {
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (this.isUpstreamError(exceptionResponse)) {
                return {
                    status,
                    body: exceptionResponse as ErrorResponse,
                }
            }

            if (typeof exceptionResponse === 'string') {
                return {
                    status,
                    body: this.buildBody(status, exceptionResponse, exception.name, request)
                }
            }

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse as Record<string, unknown>;
                return {
                    status,
                    body: this.buildBody(
                        status,
                        (resp.message as string | string[]) ?? exception.message,
                        (resp.error as string) ?? exception.name,
                        request,
                    ),
                }
            }
        }

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: this.buildBody(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Internal server error',
                'InternalServerError',
                request
            )
        }
        
    }

    private isUpstreamError(resp: unknown): boolean {
        return (
        typeof resp === 'object' &&
        resp !== null &&
        'statusCode' in resp &&
        'message' in resp
        );
    } 

    private buildBody(
        statusCode: number,
        message: string | string[],
        error: string,
        request: Request,
    ): ErrorResponse {
        return {
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message,
        error,
        };
    }
 
    private logError(
        exception: unknown,
        request: Request,
        status: number,
    ): void {
        const meta = `${request.method} ${request.url} → ${status}`;
    
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                meta,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } else {
            this.logger.warn(
                `${meta} | ${exception instanceof Error ? exception.message : String(exception)}`,
            );
        }
    }
}