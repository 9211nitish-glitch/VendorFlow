import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PackageModel } from '../models/Package';
import { ReferralModel } from '../models/Referral';
import { UserStatus, ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const users = await UserModel.getAll(offset, limit);
      
      // Remove passwords from response
      const safeUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        referrerId: user.referrerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: safeUsers
      };

      res.json(response);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user package and referral stats
      const userPackage = await PackageModel.getUserPackage(userId);
      const referralStats = await ReferralModel.getReferralStats(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          referrerId: user.referrerId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          package: userPackage,
          referralStats
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }

  static async blockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent admin from blocking themselves
      if (userId === req.user!.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot block yourself'
        });
      }

      const success = await UserModel.updateStatus(userId, UserStatus.BLOCKED);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User blocked successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Block user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to block user'
      });
    }
  }

  static async unblockUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);

      const success = await UserModel.updateStatus(userId, UserStatus.ACTIVE);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User unblocked successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Unblock user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unblock user'
      });
    }
  }

  static async getVendors(req: AuthenticatedRequest, res: Response) {
    try {
      const vendors = await UserModel.getVendors();
      
      const safeVendors = vendors.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      }));

      const response: ApiResponse = {
        success: true,
        message: 'Vendors retrieved successfully',
        data: safeVendors
      };

      res.json(response);
    } catch (error) {
      console.error('Get vendors error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve vendors'
      });
    }
  }

  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      // This would need actual implementation based on your database queries
      // For now, returning mock structure
      const response: ApiResponse = {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalUsers: 0,
          activeUsers: 0,
          blockedUsers: 0,
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          totalRevenue: 0
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard stats'
      });
    }
  }
}
