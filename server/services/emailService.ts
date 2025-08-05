// Simple email service placeholder
// In production, you would integrate with services like SendGrid, Nodemailer, etc.

export class EmailService {
  static async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<void> {
    try {
      // For now, we'll just log the email content
      // In production, integrate with actual email service
      console.log(`
        ========== PASSWORD RESET EMAIL ==========
        To: ${email}
        Subject: Reset Your Password - Task Manager
        
        Hi ${name},
        
        You requested to reset your password. Click the link below to set a new password:
        
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        Task Manager Team
        ==========================================
      `);
      
      // TODO: Implement actual email sending
      // Example with Nodemailer:
      /*
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - Task Manager',
        html: `
          <h2>Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      */
      
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send reset email');
    }
  }
}