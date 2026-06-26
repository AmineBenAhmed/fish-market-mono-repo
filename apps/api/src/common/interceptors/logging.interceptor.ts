import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = request['requestId'] || '-';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - now;
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const log = { requestId, method, url, statusCode, elapsed: `${elapsed}ms` };

          if (elapsed > 1000) {
            this.logger.warn({ ...log, slow: true });
          } else if (statusCode >= 500) {
            this.logger.error(log);
          } else if (statusCode >= 400) {
            this.logger.warn(log);
          } else {
            this.logger.log(log);
          }
        },
        error: (error) => {
          const elapsed = Date.now() - now;
          this.logger.error({
            requestId,
            method,
            url,
            elapsed: `${elapsed}ms`,
            error: error.message,
          });
        },
      }),
    );
  }
}
