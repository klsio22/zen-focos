import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

interface RequestBody {
  password?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const body = (request.body ?? {}) as RequestBody;
    const startTime = Date.now();

    this.logger.debug(`[${method}] ${url}`);
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.debug(
          `Response for [${method}] ${url} completed in ${duration}ms`,
        );
      }),
    );
  }

  private sanitizeBody(body: RequestBody): RequestBody {
    const sanitized = { ...body };
    // Prevent logging sensitive fields
    if (sanitized.password) {
      sanitized.password = '***';
    }
    return sanitized;
  }
}
