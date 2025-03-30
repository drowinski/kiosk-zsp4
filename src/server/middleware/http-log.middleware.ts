import { NextFunction, Request, Response } from 'express';

export function httpLogMiddleware(request: Request, response: Response, next: NextFunction) {
  request.context.logger.info(`[${request.method}] ${request.url}`);
  next();
}
