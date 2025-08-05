import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthResponse, ApiResponse } from '../../shared/schema';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../shared/schema';

export class AuthController {
  // Registration validation middleware
  static validateRegister = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('referralCode').optional().trim()
  ];

  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userData = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Validate referral code if provided
      let referrerId: number | undefined;
      if (userData.referralCode) {
        const referrer = await UserModel.findByReferralCode(userData.referralCode);
        if (!referrer) {
          return res.status(400).json({
            success: false,
            message: 'Invalid referral code'
          });
        }
        referrerId = referrer.id;
      }

      const user = await UserModel.createFromRegistration({
        ...userData,
        referrerId
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'NitishTrytohard@22000',
        { expiresIn: '7d' }
      );

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            referralCode: user.referralCode,
            referrerId: user.referrerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = loginSchema.parse(req.body);
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is blocked. Please contact support.'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password || '');
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'NitishTrytohard@22000',
        { expiresIn: '7d' }
      );

      const response = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            referralCode: user.referralCode,
            referrerId: user.referrerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Login validation middleware
  static validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ];

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          referrerId: user.referrerId,
          googleId: user.googleId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
      });
    }
  }

  // Google OAuth Routes
  static async googleAuth(req: Request, res: Response) {
    try {
      const { GoogleAuthService } = await import('../services/googleAuthService');
      const authUrl = await GoogleAuthService.getAuthUrl();
      
      res.json({
        success: true,
        message: 'Google auth URL generated',
        data: { authUrl }
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate Google auth URL'
      });
    }
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Authorization code is required'
        });
      }

      const { GoogleAuthService } = await import('../services/googleAuthService');
      const googleData = await GoogleAuthService.verifyGoogleToken(code);
      const user = await GoogleAuthService.handleGoogleAuth(googleData);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'NitishTrytohard@22000',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth/error?message=Google authentication failed`;
      res.redirect(errorUrl);
    }
  }

  // Forgot Password Routes
  static validateForgotPassword = [
    body('email').isEmail().withMessage('Valid email is required')
  ];

  static async forgotPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = forgotPasswordSchema.parse(req.body);
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'NitishTrytohard@22000',
        { expiresIn: '1h' }
      );

      // Store reset token (in a real app, you'd send an email)
      await UserModel.updateResetToken(user.id, resetToken);

      res.json({
        success: true,
        message: 'Password reset link sent to your email',
        data: { resetToken } // Remove this in production
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process forgot password request'
      });
    }
  }

  static validateResetPassword = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ];

  static async resetPassword(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { token, password } = resetPasswordSchema.parse(req.body);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NitishTrytohard@22000') as any;
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
          });
        }

        // Update password and clear reset token
        const hashedPassword = await bcrypt.hash(password, 12);
        await UserModel.updatePassword(user.id, hashedPassword);
        // await UserModel.clearResetToken(user.id); // TODO: Implement when model supports it

        res.json({
          success: true,
          message: 'Password reset successful'
        });
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }

  static async validateResetToken(req: Request, res: Response) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Reset token is required'
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NitishTrytohard@22000') as any;
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired reset token'
          });
        }
        
        // TODO: Add reset token validation when user model supports it

        res.json({
          success: true,
          message: 'Reset token is valid'
        });
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
    } catch (error) {
      console.error('Validate reset token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate reset token'
      });
    }
  }
}