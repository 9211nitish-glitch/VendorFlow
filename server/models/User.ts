import { pool } from '../config/database';
import { User, UserRole, UserStatus, InsertUser } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export class UserModel {
  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const users = rows as User[];
    return users[0] || null;
  }

  static async findByReferralCode(referralCode: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE referralCode = ?',
      [referralCode]
    );
    const users = rows as User[];
    return users[0] || null;
  }

  static async create(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const referralCode = nanoid(8);
    
    // Check if this is the first user (should be admin)
    const [countResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const count = (countResult as any)[0].count;
    const role = count === 0 ? UserRole.ADMIN : UserRole.VENDOR;

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, role, status, referralCode, referrerId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.email,
        hashedPassword,
        role,
        UserStatus.ACTIVE,
        referralCode,
        userData.referrerId || null
      ]
    );

    const insertResult = result as any;
    const newUser = await this.findById(insertResult.insertId);
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }

    // Create starter package for new vendor
    if (role === UserRole.VENDOR) {
      await this.assignStarterPackage(newUser.id);
    }

    return newUser;
  }

  static async updateStatus(id: number, status: UserStatus): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async getAll(offset = 0, limit = 50): Promise<User[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as User[];
  }

  static async getVendors(): Promise<User[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE role = ? ORDER BY name ASC',
      [UserRole.VENDOR]
    );
    return rows as User[];
  }

  static async assignStarterPackage(userId: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365); // 365 days validity

    await pool.execute(
      `INSERT INTO user_packages (userId, packageId, expiresAt) VALUES (?, 1, ?)`,
      [userId, expiresAt]
    );
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
