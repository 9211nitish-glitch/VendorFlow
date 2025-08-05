import { Request, Response } from 'express';
import { PackageModel } from '../models/Package';
import { ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';
import { validationResult, body } from 'express-validator';

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

  static validateCreatePackage = [
    body('name').notEmpty().withMessage('Package name is required'),
    body('type').isIn(['Onsite', 'Online']).withMessage('Package type must be Onsite or Online'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('taskLimit').isInt({ min: 1 }).withMessage('Task limit must be at least 1'),
    body('skipLimit').isInt({ min: 0 }).withMessage('Skip limit must be non-negative'),
    body('description').optional().isString()
  ];

  static async createPackage(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const packageData = req.body;
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

  static validateUpdatePackage = [
    body('name').optional().notEmpty().withMessage('Package name cannot be empty'),
    body('type').optional().isIn(['Onsite', 'Online']).withMessage('Package type must be Onsite or Online'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('taskLimit').optional().isInt({ min: 1 }).withMessage('Task limit must be at least 1'),
    body('skipLimit').optional().isInt({ min: 0 }).withMessage('Skip limit must be non-negative'),
    body('description').optional().isString()
  ];

  static async updatePackage(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const packageId = parseInt(req.params.id);
      const packageData = req.body;
      
      const updatedPackage = await PackageModel.update(packageId, packageData);
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
      
      const success = await PackageModel.delete(packageId);
      if (!success) {
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
      res.status(500).json({
        success: false,
        message: 'Failed to delete package'
      });
    }
  }
}