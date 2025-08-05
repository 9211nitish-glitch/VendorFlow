import { pool } from '../config/database';
import { Referral, ReferralStats } from '@shared/schema';

const COMMISSION_RATES = {
  1: 0.10, // 10%
  2: 0.05, // 5%
  3: 0.04, // 4%
  4: 0.03, // 3%
  5: 0.02  // 2%
};

export class ReferralModel {
  static async createReferralChain(referrerId: number, referredId: number, packagePrice: number): Promise<void> {
    const referrals = await this.buildReferralChain(referrerId, 1);
    
    for (const referral of referrals) {
      if (referral.level <= 5) {
        const commission = packagePrice * COMMISSION_RATES[referral.level as keyof typeof COMMISSION_RATES];
        
        await pool.execute(
          `INSERT INTO referrals (referrerId, referredId, level, commission) VALUES (?, ?, ?, ?)`,
          [referral.referrerId, referredId, referral.level, commission]
        );
      }
    }
  }

  static async buildReferralChain(userId: number, level: number): Promise<Array<{referrerId: number, level: number}>> {
    if (level > 5) return [];

    const [rows] = await pool.execute(
      'SELECT referrerId FROM users WHERE id = ? AND referrerId IS NOT NULL',
      [userId]
    );
    
    const users = rows as Array<{referrerId: number}>;
    if (users.length === 0) return [];

    const referrerId = users[0].referrerId;
    const chain = [{ referrerId, level }];
    
    // Recursively build the chain
    const upperChain = await this.buildReferralChain(referrerId, level + 1);
    return chain.concat(upperChain);
  }

  static async getReferralStats(userId: number): Promise<ReferralStats> {
    const [totalRows] = await pool.execute(
      'SELECT COUNT(*) as count, COALESCE(SUM(commission), 0) as total FROM referrals WHERE referrerId = ?',
      [userId]
    );
    
    const totalResult = totalRows as Array<{count: number, total: number}>;
    const totalReferrals = totalResult[0].count;
    const totalEarnings = totalResult[0].total;

    // Monthly earnings
    const [monthlyRows] = await pool.execute(
      `SELECT COALESCE(SUM(commission), 0) as total FROM referrals 
       WHERE referrerId = ? AND MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())`,
      [userId]
    );
    
    const monthlyResult = monthlyRows as Array<{total: number}>;
    const monthlyEarnings = monthlyResult[0].total;

    // Referrals by level
    const [levelRows] = await pool.execute(
      'SELECT level, COUNT(*) as count FROM referrals WHERE referrerId = ? GROUP BY level',
      [userId]
    );
    
    const levelResult = levelRows as Array<{level: number, count: number}>;
    const referralsByLevel: Record<number, number> = {};
    levelResult.forEach(row => {
      referralsByLevel[row.level] = row.count;
    });

    return {
      totalReferrals,
      totalEarnings,
      monthlyEarnings,
      referralsByLevel
    };
  }

  static async getUserReferrals(userId: number): Promise<Array<Referral & {referredName: string}>> {
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as referredName 
       FROM referrals r 
       JOIN users u ON r.referredId = u.id 
       WHERE r.referrerId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    
    return rows as Array<Referral & {referredName: string}>;
  }

  static async getTopReferrers(limit = 10): Promise<Array<{userId: number, name: string, totalReferrals: number, totalEarnings: number}>> {
    const [rows] = await pool.execute(
      `SELECT u.id as userId, u.name, COUNT(r.id) as totalReferrals, COALESCE(SUM(r.commission), 0) as totalEarnings
       FROM users u
       LEFT JOIN referrals r ON u.id = r.referrerId
       WHERE u.role = 'vendor'
       GROUP BY u.id, u.name
       HAVING totalReferrals > 0
       ORDER BY totalEarnings DESC
       LIMIT ?`,
      [limit]
    );
    
    return rows as Array<{userId: number, name: string, totalReferrals: number, totalEarnings: number}>;
  }
}
