import { NextFunction, Request, Response } from 'express';

export function httpLogMiddleware(request: Request, response: Response, next: NextFunction) {
  if (request.url.startsWith('/__manifest')) {
    next();
    return;
  }
  request.context.logger.info(`[${request.method}] ${request.url}`);
  next();
}
