import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { status as grpcStatus } from '@grpc/grpc-js';
import { Request, Response } from 'express';
import { ErrorResponse } from '../../types';

// RpcException({ code: grpcStatus.X, message }) — the convention this repo's
// gRPC services (polls, blockchain) throw — carries a `code` field, not
// `statusCode`/`status`. Standard gRPC-to-HTTP mapping (used by grpc-gateway).
const GRPC_STATUS_TO_HTTP: Partial<Record<number, number>> = {
  [grpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [grpcStatus.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
  [grpcStatus.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
  [grpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [grpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [grpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [grpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [grpcStatus.ABORTED]: HttpStatus.CONFLICT,
  [grpcStatus.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [grpcStatus.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [grpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [grpcStatus.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};

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
    request: Request,
  ): { status: number; body: ErrorResponse } {
    // CHECKING HTTP ERRORS FIRST
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
          body: this.buildBody(
            status,
            exceptionResponse,
            exception.name,
            request,
          ),
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

    // CHECKING RAW OBJECTS ERRORS (Microservices, Rpc)
    if (typeof exception === 'object' && exception !== null) {
      const errorObj = exception as Record<string, any>;

      const parseStatus = (val: any): number | null => {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      };

      const innerResponse = errorObj.response;
      if (innerResponse && typeof innerResponse === 'object') {
        const status =
          parseStatus(innerResponse.statusCode) ??
          parseStatus(innerResponse.status) ??
          HttpStatus.INTERNAL_SERVER_ERROR;
        return {
          status,
          body: this.buildBody(
            status,
            innerResponse.message ?? 'Microservice error',
            innerResponse.error ?? 'MicroserviceError',
            request,
          ),
        };
      }

      if ('message' in errorObj) {
        // A gRPC client error (from polls/blockchain) is a ServiceError: no
        // statusCode/status, just a numeric `code` and a `details` string —
        // `.message` on it is grpc-js's own "6 ALREADY_EXISTS: ..." formatting.
        const grpcHttpStatus =
          typeof errorObj.code === 'number'
            ? GRPC_STATUS_TO_HTTP[errorObj.code]
            : undefined;
        const status =
          grpcHttpStatus ??
          parseStatus(errorObj.statusCode) ??
          parseStatus(errorObj.status) ??
          HttpStatus.INTERNAL_SERVER_ERROR;
        return {
          status,
          body: this.buildBody(
            status,
            errorObj.details ?? errorObj.message,
            errorObj.error ?? 'MicroserviceError',
            request,
          ),
        };
      }
    }

    // Fall to 500 for everything else (crashes, code errors, etc)
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: this.buildBody(
        HttpStatus.INTERNAL_SERVER_ERROR,
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
        'InternalServerError',
        request,
      ),
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

  private logError(exception: unknown, request: Request, status: number): void {
    const meta = `${request.method} ${request.url} → ${status}`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const errorDetail =
        exception instanceof Error
          ? exception.stack
          : typeof exception === 'object'
            ? JSON.stringify(exception, null, 2)
            : String(exception);

      this.logger.error(meta, errorDetail);
    } else {
      const errorDetail =
        exception instanceof Error
          ? exception.message
          : typeof exception === 'object'
            ? JSON.stringify(exception)
            : String(exception);

      this.logger.warn(`${meta} | ${errorDetail}`);
    }
  }
}
