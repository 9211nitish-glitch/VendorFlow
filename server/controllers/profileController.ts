import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/User';
import { updateProfileSchema } from '@shared/schema';

export class ProfileController {
  static validateUpdateProfile = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('phone').optional().trim().isLength({ min: 10 }).withMessage('Phone must be at least 10 digits'),
    body('bankAccountName').optional().trim(),
    body('bankAccountNumber').optional().trim(),
    body('bankIfscCode').optional().trim(),
    body('bankName').optional().trim(),
    body('upiId').optional().trim()
  ];

  static async updateProfile(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const updateData = updateProfileSchema.parse(req.body);
      
      // Build update query dynamically
      const fields = Object.keys(updateData).filter(key => updateData[key as keyof typeof updateData] !== undefined);
      
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      const setClause = fields.map(field => {
        // Convert camelCase to snake_case for database
        const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbField} = ?`;
      }).join(', ');

      const values = fields.map(field => updateData[field as keyof typeof updateData]);
      values.push(userId); // for WHERE clause

      await UserModel.updateProfile(userId, updateData);

      const updatedUser = await UserModel.findById(userId);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser!.id,
            name: updatedUser!.name,
            email: updatedUser!.email,
            role: updatedUser!.role,
            status: updatedUser!.status,
            referralCode: updatedUser!.referralCode,
            profilePhoto: updatedUser!.profilePhoto,
            bio: updatedUser!.bio,
            phone: updatedUser!.phone,
            walletBalance: updatedUser!.walletBalance,
            bankAccountName: updatedUser!.bankAccountName,
            bankAccountNumber: updatedUser!.bankAccountNumber,
            bankIfscCode: updatedUser!.bankIfscCode,
            bankName: updatedUser!.bankName,
            upiId: updatedUser!.upiId,
            createdAt: updatedUser!.createdAt,
            updatedAt: updatedUser!.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  static async uploadProfilePhoto(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      
      await UserModel.updateProfile(userId, { profilePhoto: photoUrl });

      res.json({
        success: true,
        message: 'Profile photo updated successfully',
        data: { profilePhoto: photoUrl }
      });
    } catch (error) {
      console.error('Upload profile photo error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile photo'
      });
    }
  }
}