import { Request, Response } from 'express';
import { ReferralModel } from '../models/Referral';
import { ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export class ReferralController {
  static async getReferralStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await ReferralModel.getReferralStats(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Referral stats retrieved successfully',
        data: stats
      };

      res.json(response);
    } catch (error) {
      console.error('Get referral stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve referral stats'
      });
    }
  }

  static async getUserReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const referrals = await ReferralModel.getUserReferrals(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User referrals retrieved successfully',
        data: referrals
      };

      res.json(response);
    } catch (error) {
      console.error('Get user referrals error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user referrals'
      });
    }
  }

  static async getTopReferrers(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topReferrers = await ReferralModel.getTopReferrers(limit);

      const response: ApiResponse = {
        success: true,
        message: 'Top referrers retrieved successfully',
        data: topReferrers
      };

      res.json(response);
    } catch (error) {
      console.error('Get top referrers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top referrers'
      });
    }
  }

  static async getReferralSystemStats(req: AuthenticatedRequest, res: Response) {
    try {
      // This would need actual implementation based on your database queries
      // For now, returning mock structure for the admin dashboard
      const response: ApiResponse = {
        success: true,
        message: 'Referral system stats retrieved successfully',
        data: {
          totalReferrals: 0,
          activeReferrers: 0,
          totalPayouts: 0,
          referralsByLevel: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get referral system stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve referral system stats'
      });
    }
  }
}
