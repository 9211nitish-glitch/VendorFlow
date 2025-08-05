import { pool as db } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserProfile {
  id: number;
  userId: number;
  phone?: string;
  bio?: string;
  location?: string;
  contentCreatorType?: string;
  socialLinks?: string; // JSON string
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileData {
  userId: number;
  phone?: string;
  bio?: string;
  location?: string;
  contentCreatorType?: string;
  socialLinks?: object;
  profilePhoto?: string;
}

export interface UpdateUserProfileData {
  phone?: string;
  bio?: string;
  location?: string;
  contentCreatorType?: string;
  socialLinks?: object;
  profilePhoto?: string;
}

export class UserProfileModel {
  static async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        phone VARCHAR(20),
        bio TEXT,
        location VARCHAR(255),
        contentCreatorType VARCHAR(50),
        socialLinks JSON,
        profilePhoto VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await db.execute(query);
  }

  static async findByUserId(userId: number): Promise<UserProfile | null> {
    const query = `
      SELECT up.*, u.name, u.email 
      FROM user_profiles up
      JOIN users u ON up.userId = u.id
      WHERE up.userId = ?
    `;
    
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const profile = rows[0] as any;
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null
    };
  }

  static async create(data: CreateUserProfileData): Promise<UserProfile> {
    const query = `
      INSERT INTO user_profiles (userId, phone, bio, location, contentCreatorType, socialLinks, profilePhoto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const socialLinksJson = data.socialLinks ? JSON.stringify(data.socialLinks) : null;
    
    const [result] = await db.execute<ResultSetHeader>(query, [
      data.userId,
      data.phone || null,
      data.bio || null,
      data.location || null,
      data.contentCreatorType || null,
      socialLinksJson,
      data.profilePhoto || null
    ]);
    
    const profile = await this.findById(result.insertId);
    if (!profile) {
      throw new Error('Failed to create user profile');
    }
    
    return profile;
  }

  static async update(userId: number, data: UpdateUserProfileData): Promise<UserProfile> {
    // First, check if profile exists
    let profile = await this.findByUserId(userId);
    
    if (!profile) {
      // Create new profile if it doesn't exist
      profile = await this.create({ userId, ...data });
      return profile;
    }
    
    const query = `
      UPDATE user_profiles 
      SET phone = ?, bio = ?, location = ?, contentCreatorType = ?, socialLinks = ?, profilePhoto = ?
      WHERE userId = ?
    `;
    
    const socialLinksJson = data.socialLinks ? JSON.stringify(data.socialLinks) : null;
    
    await db.execute(query, [
      data.phone || null,
      data.bio || null,
      data.location || null,
      data.contentCreatorType || null,
      socialLinksJson,
      data.profilePhoto || null,
      userId
    ]);
    
    const updatedProfile = await this.findByUserId(userId);
    if (!updatedProfile) {
      throw new Error('Failed to update user profile');
    }
    
    return updatedProfile;
  }

  static async findById(id: number): Promise<UserProfile | null> {
    const query = `
      SELECT up.*, u.name, u.email 
      FROM user_profiles up
      JOIN users u ON up.userId = u.id
      WHERE up.id = ?
    `;
    
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const profile = rows[0] as any;
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null
    };
  }

  static async updateProfilePhoto(userId: number, profilePhoto: string): Promise<void> {
    // First, check if profile exists
    let profile = await this.findByUserId(userId);
    
    if (!profile) {
      // Create new profile if it doesn't exist
      await this.create({ userId, profilePhoto });
      return;
    }
    
    const query = `UPDATE user_profiles SET profilePhoto = ? WHERE userId = ?`;
    await db.execute(query, [profilePhoto, userId]);
  }
}