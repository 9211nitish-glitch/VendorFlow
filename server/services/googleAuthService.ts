import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import { userService } from './userService';
import { generateReferralCode } from '../utils/referralUtils';
import { UserRole, UserStatus, User } from '../../shared/schema';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === 'production' 
    ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'your-domain.com'}/api/auth/google/callback`
    : 'http://localhost:5000/api/auth/google/callback'
);

export class GoogleAuthService {
  static async getAuthUrl(): Promise<string> {
    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'consent'
    });
    return authUrl;
  }

  static async verifyGoogleToken(code: string) {
    try {
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture
      };
    } catch (error) {
      console.error('Google auth verification error:', error);
      throw new Error('Failed to verify Google token');
    }
  }

  static async handleGoogleAuth(googleData: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }) {
    try {
      // Check if user exists with this Google ID
      let user = await userService.findByGoogleId(googleData.googleId);
      
      if (user) {
        return user;
      }

      // Check if user exists with this email
      user = await userService.findByEmail(googleData.email);
      
      if (user) {
        // Link Google account to existing user
        await userService.linkGoogleAccount(user.id, googleData.googleId);
        return { ...user, googleId: googleData.googleId };
      }

      // Create new user
      const referralCode = await generateReferralCode();
      const newUser = await userService.create({
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.googleId,
        role: UserRole.VENDOR,
        status: UserStatus.ACTIVE,
        referralCode
      });

      return newUser;
    } catch (error) {
      console.error('Google auth handling error:', error);
      throw new Error('Failed to handle Google authentication');
    }
  }
}