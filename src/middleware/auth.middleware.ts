import { Request, Response, NextFunction } from 'express';
import { decodeToken } from '../lib/helper';

export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.user) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
    return;
  }
};
