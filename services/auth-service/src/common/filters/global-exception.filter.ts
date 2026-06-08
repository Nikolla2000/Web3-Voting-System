import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response, Request } from "express";
import { ErrorResponse } from "src/auth/auth.types";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { status, message, error } = this.extractErrorDetails(exception);

        const errorResponse: ErrorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error
            
        }
        this.logError(exception, request, status);
 
        response.status(status).json(errorResponse);
    }

    private extractErrorDetails(exception: unknown): {
        status: number;
        message: string | string[];
        error: string;
    } {
        if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
    
        if (typeof exceptionResponse === 'string') {
            return {
            status,
            message: exceptionResponse,
            error: exception.name,
            };
        }
    
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            const resp = exceptionResponse as Record<string, unknown>;
            return {
            status,
            message: (resp.message as string | string[]) ?? exception.message,
            error: (resp.error as string) ?? exception.name,
        };
      }
    }
 
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }

  private logError (
    exception: unknown,
    request: Request,
    status: number,
  ) : void {
    const meta = `${request.method} ${request.url} → ${status}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
            meta,
            exception instanceof Error ? exception.stack : String(exception)
        );
    } else {
        this.logger.warn(
            `${meta} | ${exception instanceof Error ? exception.message : String(exception)}`,
        )
    }
  }
}