import { Request, Response } from 'express';
import { PackageModel } from '../models/Package';
import { ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export class PackageController {
  static async getUserPackage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userPackage = await PackageModel.getUserPackageWithDetails(userId);

      if (!userPackage) {
        return res.status(404).json({
          success: false,
          message: 'No active package found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User package retrieved successfully',
        data: userPackage
      };

      res.json(response);
    } catch (error) {
      console.error('Get user package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user package'
      });
    }
  }

  static async getAllPackages(req: Request, res: Response) {
    try {
      const packages = await PackageModel.getAll();

      const response: ApiResponse = {
        success: true,
        message: 'Packages retrieved successfully',
        data: packages
      };

      res.json(response);
    } catch (error) {
      console.error('Get packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve packages'
      });
    }
  }

  static async getPackageById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const packageData = await PackageModel.findById(id);

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Package retrieved successfully',
        data: packageData
      };

      res.json(response);
    } catch (error) {
      console.error('Get package by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve package'
      });
    }
  }

  static async checkUserLimits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userPackage = await PackageModel.getUserPackageWithDetails(userId);

      if (!userPackage) {
        return res.status(404).json({
          success: false,
          message: 'No active package found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'User limits retrieved successfully',
        data: {
          tasksRemaining: userPackage.tasksRemaining,
          skipsRemaining: userPackage.skipsRemaining,
          daysLeft: userPackage.daysLeft,
          canPerformTask: userPackage.tasksRemaining > 0,
          canSkip: userPackage.skipsRemaining > 0 || userPackage.tasksRemaining > 0
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Check user limits error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check user limits'
      });
    }
  }

  static async createPackage(req: AuthenticatedRequest, res: Response) {
    try {
      // Implementation would go here for admin package creation
      res.status(501).json({
        success: false,
        message: 'Not implemented yet'
      });
    } catch (error) {
      console.error('Create package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create package'
      });
    }
  }

  static async updatePackage(req: AuthenticatedRequest, res: Response) {
    try {
      // Implementation would go here for admin package updates
      res.status(501).json({
        success: false,
        message: 'Not implemented yet'
      });
    } catch (error) {
      console.error('Update package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update package'
      });
    }
  }

  static async deletePackage(req: AuthenticatedRequest, res: Response) {
    try {
      // Implementation would go here for admin package deletion
      res.status(501).json({
        success: false,
        message: 'Not implemented yet'
      });
    } catch (error) {
      console.error('Delete package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete package'
      });
    }
  }
}