import { pool } from '../config/database';
import { Package, UserPackage } from '@shared/schema';

export class PackageModel {
  static async findById(id: number): Promise<Package | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE id = ?',
      [id]
    );
    const packages = rows as Package[];
    return packages[0] || null;
  }

  static async getAll(): Promise<Package[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM packages WHERE isActive = TRUE ORDER BY price ASC'
    );
    return rows as Package[];
  }

  static async getUserPackage(userId: number): Promise<UserPackage | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM user_packages 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW() 
       ORDER BY createdAt DESC LIMIT 1`,
      [userId]
    );
    const userPackages = rows as UserPackage[];
    return userPackages[0] || null;
  }

  static async createUserPackage(userId: number, packageId: number): Promise<UserPackage> {
    // Deactivate existing packages
    await pool.execute(
      'UPDATE user_packages SET isActive = FALSE WHERE userId = ?',
      [userId]
    );

    const packageInfo = await this.findById(packageId);
    if (!packageInfo) {
      throw new Error('Package not found');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + packageInfo.validityDays);

    const [result] = await pool.execute(
      `INSERT INTO user_packages (userId, packageId, expiresAt) VALUES (?, ?, ?)`,
      [userId, packageId, expiresAt]
    );

    const insertResult = result as any;
    const [newPackageRows] = await pool.execute(
      'SELECT * FROM user_packages WHERE id = ?',
      [insertResult.insertId]
    );
    
    const newPackages = newPackageRows as UserPackage[];
    return newPackages[0];
  }

  static async incrementTaskUsage(userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE user_packages 
       SET tasksUsed = tasksUsed + 1, updatedAt = CURRENT_TIMESTAMP 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW()`,
      [userId]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async incrementSkipUsage(userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE user_packages 
       SET skipsUsed = skipsUsed + 1, updatedAt = CURRENT_TIMESTAMP 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW()`,
      [userId]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async canUserPerformAction(userId: number, action: 'task' | 'skip'): Promise<boolean> {
    const userPackage = await this.getUserPackage(userId);
    if (!userPackage) return false;

    const packageInfo = await this.findById(userPackage.packageId);
    if (!packageInfo) return false;

    if (action === 'task') {
      return userPackage.tasksUsed < packageInfo.taskLimit;
    } else if (action === 'skip') {
      return userPackage.skipsUsed < packageInfo.skipLimit;
    }

    return false;
  }
}
