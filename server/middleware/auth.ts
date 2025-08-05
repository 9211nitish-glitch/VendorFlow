import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { UserRole } from '@shared/schema';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
    email: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NitishTrytohard@22000') as any;
    const user = await UserModel.findById(decoded.id);
    
    if (!user || user.status === 'blocked') {
      return res.status(401).json({ success: false, message: 'Invalid or blocked user' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

export const requireVendor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.VENDOR) {
    return res.status(403).json({ success: false, message: 'Vendor access required' });
  }
  next();
};
