import { pool } from '../config/database';
import { Payment, PaymentStatus, InsertPayment } from '@shared/schema';

export class PaymentModel {
  static async create(paymentData: InsertPayment): Promise<Payment> {
    const [result] = await pool.execute(
      `INSERT INTO payments (userId, packageId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        paymentData.userId,
        paymentData.packageId,
        paymentData.amount,
        paymentData.razorpayOrderId,
        paymentData.razorpayPaymentId || null,
        paymentData.razorpaySignature || null
      ]
    );

    const insertResult = result as any;
    const [newPaymentRows] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [insertResult.insertId]
    );
    
    const payments = newPaymentRows as Payment[];
    return payments[0];
  }

  static async findById(id: number): Promise<Payment | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    const payments = rows as Payment[];
    return payments[0] || null;
  }

  static async findByOrderId(orderId: string): Promise<Payment | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE razorpayOrderId = ?',
      [orderId]
    );
    const payments = rows as Payment[];
    return payments[0] || null;
  }

  static async updateStatus(paymentId: number, status: PaymentStatus, paymentDetails?: {
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }): Promise<boolean> {
    let query = 'UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP';
    const params: any[] = [status];

    if (paymentDetails?.razorpayPaymentId) {
      query += ', razorpayPaymentId = ?';
      params.push(paymentDetails.razorpayPaymentId);
    }

    if (paymentDetails?.razorpaySignature) {
      query += ', razorpaySignature = ?';
      params.push(paymentDetails.razorpaySignature);
    }

    query += ' WHERE id = ?';
    params.push(paymentId);

    const [result] = await pool.execute(query, params);
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async getUserPayments(userId: number): Promise<Payment[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return rows as Payment[];
  }

  static async getAllPayments(offset = 0, limit = 50): Promise<Payment[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM payments ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Payment[];
  }
}
