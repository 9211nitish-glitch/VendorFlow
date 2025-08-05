import { pool } from '../config/database';
import { WalletTransaction, WalletTransactionType, WalletTransactionStatus } from '@shared/schema';

export class WalletTransactionModel {
  static async create(data: {
    userId: number;
    type: WalletTransactionType;
    amount: number;
    description: string;
    taskId?: number;
    referenceId?: string;
    status?: WalletTransactionStatus;
  }): Promise<WalletTransaction> {
    const [result] = await pool.execute(
      `INSERT INTO wallet_transactions (user_id, type, amount, description, task_id, reference_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.type,
        data.amount,
        data.description,
        data.taskId || null,
        data.referenceId || null,
        data.status || WalletTransactionStatus.COMPLETED
      ]
    );

    const insertResult = result as any;
    return this.findById(insertResult.insertId);
  }

  static async findById(id: number): Promise<WalletTransaction> {
    const [rows] = await pool.execute(
      'SELECT * FROM wallet_transactions WHERE id = ?',
      [id]
    );
    const transactions = rows as WalletTransaction[];
    return transactions[0];
  }

  static async findByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<WalletTransaction[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM wallet_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows as WalletTransaction[];
  }

  static async getUserBalance(userId: number): Promise<number> {
    const [rows] = await pool.execute(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as balance
       FROM wallet_transactions 
       WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );
    const result = rows as any[];
    return result[0]?.balance || 0;
  }

  static async addTaskEarning(userId: number, amount: number, taskId: number): Promise<WalletTransaction> {
    // Add credit transaction for task completion
    const transaction = await this.create({
      userId,
      type: WalletTransactionType.CREDIT,
      amount,
      description: `Task completion reward - Task #${taskId}`,
      taskId,
      referenceId: `task_${taskId}_${Date.now()}`
    });

    // Update user's wallet balance in users table
    await pool.execute(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [amount, userId]
    );

    return transaction;
  }

  static async deductAmount(userId: number, amount: number, description: string, referenceId?: string): Promise<WalletTransaction> {
    // Check if user has sufficient balance
    const balance = await this.getUserBalance(userId);
    if (balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Add debit transaction
    const transaction = await this.create({
      userId,
      type: WalletTransactionType.DEBIT,
      amount,
      description,
      referenceId
    });

    // Update user's wallet balance in users table
    await pool.execute(
      'UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?',
      [amount, userId]
    );

    return transaction;
  }
}