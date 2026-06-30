import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url } = request;
    const userAgent = request.get('user-agent') ?? '-';
    const ip = this.extractIp(request);
    const start = Date.now();

    const safePath = this.sanitizePath(url);

    this.logger.log(`→ ${method} ${safePath} [${ip}] [${userAgent}]`);

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(
            `← ${method} ${safePath} ${response.statusCode} +${ms}ms`,
          );
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
   * Prefer X-Forwarded-For (set by Render/reverse proxy),
   * fall back to socket remote address.
   */
  private extractIp(request: Request): string {
    const forwarded = request.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.socket?.remoteAddress ?? 'unknown';
  }

  /**
   * Dropping query strings on sensitive auth routes so credentials never appear in logs
   */
  private sanitizePath(url: string): string {
    const sensitiveSegments = ['/auth', '/login', '/register', '/refresh', '/google'];
    const isSensitive = sensitiveSegments.some((seg) => url.includes(seg));
    return isSensitive ? url.split('?')[0] : url;
  }
}