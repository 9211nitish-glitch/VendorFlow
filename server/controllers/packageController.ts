import { Request, Response } from 'express';
import { PackageModel } from '../models/Package';
import { ApiResponse, insertPackageSchema, InsertPackage } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

export class PackageController {
  static async getAllPackages(req: AuthenticatedRequest, res: Response) {
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

  static async getUserPackage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userPackage = await PackageModel.getUserPackage(userId);

      if (!userPackage) {
        return res.status(404).json({
          success: false,
          message: 'No active package found'
        });
      }

      // Get package details
      const packageDetails = await PackageModel.findById(userPackage.packageId);

      const response: ApiResponse = {
        success: true,
        message: 'User package retrieved successfully',
        data: {
          ...userPackage,
          packageDetails
        }
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

  static async getPackageById(req: AuthenticatedRequest, res: Response) {
    try {
      const packageId = parseInt(req.params.id);
      const packageInfo = await PackageModel.findById(packageId);

      if (!packageInfo) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Package retrieved successfully',
        data: packageInfo
      };

      res.json(response);
    } catch (error) {
      console.error('Get package error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve package'
      });
    }
  }

  static async checkUserLimits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      const canPerformTask = await PackageModel.canUserPerformAction(userId, 'task');
      const canSkip = await PackageModel.canUserPerformAction(userId, 'skip');

      const response: ApiResponse = {
        success: true,
        message: 'User limits checked successfully',
        data: {
          canPerformTask,
          canSkip
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
      const result = insertPackageSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package data',
          errors: result.error.errors
        });
      }

      const packageData = result.data;
      const newPackage = await PackageModel.create(packageData);

      const response: ApiResponse = {
        success: true,
        message: 'Package created successfully',
        data: newPackage
      };

      res.status(201).json(response);
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
      const packageId = parseInt(req.params.id);
      
      const result = insertPackageSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package data',
          errors: result.error.errors
        });
      }

      const updatedPackage = await PackageModel.update(packageId, result.data);

      if (!updatedPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Package updated successfully',
        data: updatedPackage
      };

      res.json(response);
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
      const packageId = parseInt(req.params.id);

      const deleted = await PackageModel.delete(packageId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Package deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete package error:', error);
      
      if (error instanceof Error && error.message.includes('currently being used')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete package'
      });
    }
  }
}
