import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userService } from './userService';
import { EmailService } from './emailService';

export class PasswordResetService {
  static async generateResetToken(email: string): Promise<boolean> {
    try {
      const user = await userService.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return true;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token to database
      await userService.setPasswordResetToken(user.id, resetToken, resetPasswordExpires);

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      
      await EmailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

      return true;
    } catch (error) {
      console.error('Generate reset token error:', error);
      throw new Error('Failed to generate reset token');
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await userService.findByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Check if token is expired
      if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new Error('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await userService.updatePassword(user.id, hashedPassword);
      await userService.clearPasswordResetToken(user.id);

      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static async validateResetToken(token: string): Promise<boolean> {
    try {
      const user = await userService.findByPasswordResetToken(token);
      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Validate reset token error:', error);
      return false;
    }
  }
}