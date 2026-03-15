import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.isDisabled) {
      return res.status(401).json({ error: 'User not found or disabled' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireOrganizer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Organizer access required' });
  }
  next();
};
