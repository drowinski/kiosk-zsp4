import crypto from 'node:crypto';
import { logger } from '@/lib/logging';
import { NextFunction, Request, Response } from 'express';

export function contextMiddleware(request: Request, response: Response, next: NextFunction) {
  const requestId = request.header('X-Request-Id') ?? crypto.randomUUID().split('-')[0];
  response.setHeader('X-Request-Id', requestId);

  request.context = {
    id: requestId,
    session: null,
    logger: logger.child({ httpMethod: request.method, url: request.url, requestId: requestId })
  };
  next();
}
