import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ArgumentsHost,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ArgumentsHost, next: CallHandler): Observable<unknown>;
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url } = request;
    const userAgent = request.get('user-agent') ?? '-';
    const start = Date.now();

    const safePath = this.sanitizePath(url);

    this.logger.log(`→ ${method} ${safePath} [${userAgent}]`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const { statusCode } = response;
          this.logger.log(`← ${method} ${safePath} ${statusCode} +${ms}ms`);
        },
        error: (err: unknown) => {
          const ms = Date.now() - start;
          const status =
            err instanceof Error && 'status' in err
              ? (err as { status: number }).status
              : 500;
          this.logger.warn(`← ${method} ${safePath} ${status} +${ms}ms`);
        },
      }),
    );
  }

  /**
   * Strip query strings from sensitive routes so credentials are never logged.
   */
  private sanitizePath(url: string): string {
    const sensitiveSegments = ['/auth', '/login', '/register', '/refresh', '/google'];
    const isSensitive = sensitiveSegments.some((seg) => url.includes(seg));

    if (isSensitive) {
      return url.split('?')[0];
    }

    return url;
  }
}