import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "../../types";

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
): { status: number, body: ErrorResponse } {
    
    if (typeof exception === 'object' && exception !== null) {
        const errorObj = exception as Record<string, any>;
        
        const parseStatus = (val: any): number | null => {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? null : parsed;
        };

        const innerResponse = errorObj.response;
        if (innerResponse && typeof innerResponse === 'object') {
            const status = parseStatus(innerResponse.statusCode) ?? parseStatus(innerResponse.status) ?? HttpStatus.INTERNAL_SERVER_ERROR;
            return {
                status,
                body: this.buildBody(
                    status,
                    innerResponse.message ?? 'Microservice error',
                    innerResponse.error ?? 'MicroserviceError',
                    request
                )
            };
        }

        if ('message' in errorObj) {
            const status = parseStatus(errorObj.statusCode) ?? parseStatus(errorObj.status) ?? HttpStatus.INTERNAL_SERVER_ERROR;
            return {
                status,
                body: this.buildBody(
                    status,
                    errorObj.message,
                    errorObj.error ?? 'MicroserviceError',
                    request
                )
            };
        }
    }

    if (exception instanceof HttpException) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        if (this.isUpstreamError(exceptionResponse)) {
            return {
                status,
                body: exceptionResponse as ErrorResponse,
            };
        }

        if (typeof exceptionResponse === 'string') {
            return {
                status,
                body: this.buildBody(status, exceptionResponse, exception.name, request)
            };
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
            };
        }
    }

    return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        body: this.buildBody(
            HttpStatus.INTERNAL_SERVER_ERROR,
            exception instanceof Error ? exception.message : 'Internal server error',
            'InternalServerError',
            request
        )
    };
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
        // Проверяваме дали има стек trace, ако не - сериализираме обекта, за да го прочетем
        const errorDetail = exception instanceof Error 
            ? exception.stack 
            : (typeof exception === 'object' ? JSON.stringify(exception, null, 2) : String(exception));

        this.logger.error(meta, errorDetail);
    } else {
        const errorDetail = exception instanceof Error 
            ? exception.message 
            : (typeof exception === 'object' ? JSON.stringify(exception) : String(exception));

        this.logger.warn(`${meta} | ${errorDetail}`);
    }
  }
}