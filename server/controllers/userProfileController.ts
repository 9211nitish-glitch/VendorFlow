import { Request, Response } from 'express';
import { UserProfileModel } from '../models/UserProfile';
import { body, validationResult } from 'express-validator';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export class UserProfileController {
  static validateUpdateProfile = [
    body('name').optional().isLength({ min: 2, max: 100 }).trim().withMessage('Name must be between 2-100 characters'),
    body('phone').optional().custom((value) => {
      if (!value) return true; // Allow empty phone
      // Allow Indian phone numbers with or without +91
      const phoneRegex = /^(\+91[-\s]?)?[0]?(91[-\s]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),
    body('bio').optional().isLength({ max: 500 }).trim().withMessage('Bio must be less than 500 characters'),
    body('location').optional().isLength({ max: 255 }).trim().withMessage('Location must be less than 255 characters'),
    body('contentCreatorType').optional().isIn([
      'influencer', 'blogger', 'youtuber', 'photographer', 'videographer',
      'artist', 'musician', 'podcaster', 'streamer', 'educator', 'reviewer', 'other'
    ]).withMessage('Invalid content creator type'),
    body('socialLinks').optional().isObject().withMessage('Social links must be an object'),
    body('profilePhoto').optional().isString().withMessage('Profile photo must be a string URL')
  ];

  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      let profile = await UserProfileModel.findByUserId(userId);
      
      // If no profile exists, return basic user info
      if (!profile) {
        return res.json({
          success: true,
          message: 'Profile retrieved successfully',
          data: {
            name: req.user!.email.split('@')[0], // Default name from email
            email: req.user!.email,
            phone: '',
            bio: '',
            location: '',
            contentCreatorType: '',
            socialLinks: {
              instagram: '',
              youtube: '',
              twitter: '',
              facebook: '',
              tiktok: '',
              website: ''
            },
            profilePhoto: null
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array()
        });
      }

      const userId = req.user!.id;
      const { name, phone, bio, location, contentCreatorType, socialLinks, profilePhoto } = req.body;

      // Update user name in users table if provided
      if (name) {
        const { pool } = await import('../config/database');
        await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
      }

      // Update or create profile
      const profile = await UserProfileModel.update(userId, {
        phone,
        bio,
        location,
        contentCreatorType,
        socialLinks,
        profilePhoto
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async uploadProfilePhoto(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const profilePhoto = req.body.profilePhoto;

      if (!profilePhoto) {
        return res.status(400).json({
          success: false,
          message: 'Profile photo URL is required'
        });
      }

      await UserProfileModel.updateProfilePhoto(userId, profilePhoto);

      res.json({
        success: true,
        message: 'Profile photo updated successfully',
        data: { profilePhoto }
      });
    } catch (error) {
      console.error('Error updating profile photo:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}