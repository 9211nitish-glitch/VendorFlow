import { UserModel } from '../models/User';
import { User, UserRole, UserStatus } from '../../shared/schema';
import bcrypt from 'bcryptjs';

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    return UserModel.findByEmail(email);
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    return UserModel.findByGoogleId(googleId);
  }

  static async findByPasswordResetToken(token: string): Promise<User | null> {
    return UserModel.findByPasswordResetToken(token);
  }

  static async linkGoogleAccount(userId: number, googleId: string): Promise<void> {
    await UserModel.linkGoogleAccount(userId, googleId);
  }

  static async create(userData: {
    name: string;
    email: string;
    googleId?: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
    referralCode: string;
    referrerId?: number;
  }): Promise<User> {
    return UserModel.createFromGoogle(userData);
  }

  static async setPasswordResetToken(userId: number, token: string, expires: Date): Promise<void> {
    await UserModel.setPasswordResetToken(userId, token, expires);
  }

  static async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await UserModel.updatePassword(userId, hashedPassword);
  }

  static async clearPasswordResetToken(userId: number): Promise<void> {
    await UserModel.clearPasswordResetToken(userId);
  }
}

export const userService = UserService;