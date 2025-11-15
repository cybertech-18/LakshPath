import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import env from '@config/env';

interface TokenPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
}

const extractToken = (req: Request) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.substring('Bearer '.length);
  }

  return null;
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    console.error('JWT verification failed', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const attachUserIfPresent = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, email: payload.email };
  } catch (error) {
    console.warn('Optional JWT verification failed', error);
  }

  next();
};
