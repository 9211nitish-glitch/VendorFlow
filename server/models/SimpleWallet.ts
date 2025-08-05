import { pool } from '../config/database';

export interface WalletBalance {
  userId: number;
  balance: number;
}

export interface WalletTransaction {
  id: number;
  userId: number;  
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  taskId?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export class SimpleWallet {
  // Get user's current wallet balance from users table
  static async getBalance(userId: number): Promise<number> {
    const [rows] = await pool.execute(
      'SELECT wallet_balance FROM users WHERE id = ?',
      [userId]
    );
    const result = rows as any[];
    return result[0]?.wallet_balance || 0;
  }

  // Update user's wallet balance
  static async updateBalance(userId: number, newBalance: number): Promise<void> {
    await pool.execute(
      'UPDATE users SET wallet_balance = ? WHERE id = ?',
      [newBalance, userId]
    );
  }

  // Add money to wallet (credit)
  static async addFunds(userId: number, amount: number, description: string, taskId?: number): Promise<void> {
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;
    
    // Update balance in users table
    await this.updateBalance(userId, newBalance);
    
    // Log transaction (if we want to keep history)
    await this.logTransaction(userId, 'credit', amount, description, taskId);
  }

  // Deduct money from wallet (debit)
  static async deductFunds(userId: number, amount: number, description: string): Promise<boolean> {
    const currentBalance = await this.getBalance(userId);
    
    if (currentBalance < amount) {
      return false; // Insufficient funds
    }
    
    const newBalance = currentBalance - amount;
    
    // Update balance in users table
    await this.updateBalance(userId, newBalance);
    
    // Log transaction
    await this.logTransaction(userId, 'debit', amount, description);
    
    return true;
  }

  // Create a simple transaction log in wallet_transactions table
  static async logTransaction(
    userId: number, 
    type: 'credit' | 'debit', 
    amount: number, 
    description: string, 
    taskId?: number
  ): Promise<void> {
    try {
      // Try to insert into wallet_transactions if it exists
      await pool.execute(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, related_task_id, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, type, amount, description, taskId || null]
      );
    } catch (error) {
      // If table doesn't exist or has different structure, just log to console
      console.log(`Wallet transaction: User ${userId}, ${type} ₹${amount} - ${description}`);
    }
  }

  // Get transaction history (if table exists)
  static async getTransactionHistory(userId: number, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          id,
          wallet_id as userId,
          type,
          amount,
          description,
          related_task_id as taskId,
          'completed' as status,
          created_at as createdAt
         FROM wallet_transactions 
         WHERE wallet_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows as WalletTransaction[];
    } catch (error) {
      // If table doesn't exist, return empty array
      return [];
    }
  }

  // Request withdrawal
  static async requestWithdrawal(userId: number, amount: number): Promise<boolean> {
    const success = await this.deductFunds(userId, amount, `Withdrawal request - ₹${amount}`);
    
    if (success) {
      // In a real system, you'd create a withdrawal request record
      console.log(`Withdrawal request: User ${userId} requested ₹${amount}`);
    }
    
    return success;
  }
}