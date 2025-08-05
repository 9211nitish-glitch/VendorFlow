import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { ReferralModel } from '../models/Referral';
import { insertUserSchema, registerSchema, loginSchema, ApiResponse, AuthResponse } from '@shared/schema';
import { validationResult, body } from 'express-validator';

export class AuthController {
  static validateRegister = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('referralCode').optional()
  ];

  static validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
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
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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

      if (user.status === 'blocked') {
        return res.status(401).json({
          success: false,
          message: 'Account is blocked'
        });
      }

      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'NitishTrytohard@22000',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const response: ApiResponse<AuthResponse> = {
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

  static async getProfile(req: any, res: Response) {
    try {
      const user = await UserModel.findById(req.user.id);
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
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
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

      const { forgotPasswordSchema } = await import('../../shared/schema');
      const { email } = forgotPasswordSchema.parse(req.body);

      const { PasswordResetService } = await import('../services/passwordResetService');
      await PasswordResetService.generateResetToken(email);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
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

      const { resetPasswordSchema } = await import('../../shared/schema');
      const { token, password } = resetPasswordSchema.parse(req.body);

      const { PasswordResetService } = await import('../services/passwordResetService');
      await PasswordResetService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset password'
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

      const { PasswordResetService } = await import('../services/passwordResetService');
      const isValid = await PasswordResetService.validateResetToken(token);

      res.json({
        success: true,
        message: 'Token validation result',
        data: { isValid }
      });
    } catch (error) {
      console.error('Validate reset token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate reset token'
      });
    }
  }
}
