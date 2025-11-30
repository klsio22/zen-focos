import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const { method, url, user } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const userId = user?.id || 'anonymous';
      const userEmail = user?.email || 'anonymous';
      const statusCode = res.statusCode;

      const logMessage = `${method} ${url} - User: ${userEmail} (ID: ${userId}) - Status: ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
