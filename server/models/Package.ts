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

  static async canUserPerformAction(userId: number, actionType: 'task' | 'skip'): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT up.*, p.taskLimit, p.skipLimit 
       FROM user_packages up 
       JOIN packages p ON up.packageId = p.id 
       WHERE up.userId = ? AND up.isActive = TRUE AND up.expiresAt > NOW() 
       LIMIT 1`,
      [userId]
    );
    
    const userPackages = rows as (UserPackage & { taskLimit: number; skipLimit: number })[];
    if (!userPackages.length) return false;
    
    const userPackage = userPackages[0];
    
    if (actionType === 'task') {
      return userPackage.tasksUsed < userPackage.taskLimit;
    } else if (actionType === 'skip') {
      // If skip limit exceeded, check if task limit allows
      if (userPackage.skipsUsed >= userPackage.skipLimit) {
        return userPackage.tasksUsed < userPackage.taskLimit;
      }
      return true;
    }
    
    return false;
  }

  static async getUserPackageWithDetails(userId: number): Promise<any> {
    const [rows] = await pool.execute(
      `SELECT up.*, p.name as packageName, p.taskLimit, p.skipLimit, p.validityDays, p.price,
              DATEDIFF(up.expiresAt, NOW()) as daysLeft
       FROM user_packages up 
       JOIN packages p ON up.packageId = p.id 
       WHERE up.userId = ? AND up.isActive = TRUE AND up.expiresAt > NOW() 
       ORDER BY up.createdAt DESC LIMIT 1`,
      [userId]
    );
    
    const result = rows as any[];
    if (!result.length) return null;
    
    const userPackage = result[0];
    return {
      ...userPackage,
      packageDetails: {
        name: userPackage.packageName,
        taskLimit: userPackage.taskLimit,
        skipLimit: userPackage.skipLimit,
        validityDays: userPackage.validityDays,
        price: userPackage.price
      },
      tasksRemaining: Math.max(0, userPackage.taskLimit - userPackage.tasksUsed),
      skipsRemaining: Math.max(0, userPackage.skipLimit - userPackage.skipsUsed),
      daysLeft: Math.max(0, userPackage.daysLeft)
    };
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

  static async create(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const [result] = await pool.execute(
      `INSERT INTO packages (
        name, type, taskLimit, skipLimit, validityDays, price, 
        dailyTaskLimit, soloEarn, dualEarn, earnTask, igLimitMin, ytLimitMin,
        kitBox, premiumSubscription, onsiteVideoVisit, pentaRefEarning, remoWork, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.name, packageData.type, packageData.taskLimit, packageData.skipLimit,
        packageData.validityDays, packageData.price, packageData.dailyTaskLimit,
        packageData.soloEarn, packageData.dualEarn, packageData.earnTask,
        packageData.igLimitMin, packageData.ytLimitMin, packageData.kitBox,
        packageData.premiumSubscription, packageData.onsiteVideoVisit,
        packageData.pentaRefEarning, packageData.remoWork, packageData.isActive
      ]
    );

    const insertResult = result as any;
    const newPackage = await this.findById(insertResult.insertId);
    if (!newPackage) {
      throw new Error('Failed to create package');
    }
    return newPackage;
  }

  static async update(id: number, packageData: Partial<Omit<Package, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Package | null> {
    const existingPackage = await this.findById(id);
    if (!existingPackage) {
      return null;
    }

    const updateFields = [];
    const updateValues = [];

    Object.entries(packageData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return existingPackage;
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE packages SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<boolean> {
    // Check if package is being used by any active user packages
    const [userPackageRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM user_packages WHERE packageId = ? AND isActive = TRUE',
      [id]
    );
    const userPackageCount = (userPackageRows as any)[0].count;

    if (userPackageCount > 0) {
      throw new Error('Cannot delete package that is currently being used by users');
    }

    const [result] = await pool.execute(
      'DELETE FROM packages WHERE id = ?',
      [id]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }
}
