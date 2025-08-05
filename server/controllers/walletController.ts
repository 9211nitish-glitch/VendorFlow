import { Request, Response } from 'express';
import { SimpleWallet } from '../models/SimpleWallet';
import { body, validationResult } from 'express-validator';

export class WalletController {
  static async getWalletBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const balance = await SimpleWallet.getBalance(userId);
      
      res.json({
        success: true,
        message: 'Wallet balance retrieved successfully',
        data: { balance }
      });
    } catch (error) {
      console.error('Get wallet balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet balance'
      });
    }
  }

  static async getWalletTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const transactions = await SimpleWallet.getTransactionHistory(userId, limit);
      const balance = await SimpleWallet.getBalance(userId);
      
      res.json({
        success: true,
        message: 'Wallet transactions retrieved successfully',
        data: {
          balance,
          transactions,
          pagination: {
            page,
            limit,
            hasMore: transactions.length === limit
          }
        }
      });
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet transactions'
      });
    }
  }

  static async requestWithdrawal(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { amount } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
      }

      const currentBalance = await SimpleWallet.getBalance(userId);
      
      if (currentBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      // Request withdrawal (deduct from balance)
      const success = await SimpleWallet.requestWithdrawal(userId, amount);
      
      if (success) {
        res.json({
          success: true,
          message: 'Withdrawal request submitted successfully',
          data: {
            amount,
            remainingBalance: await SimpleWallet.getBalance(userId)
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Withdrawal request failed'
        });
      }
    } catch (error) {
      console.error('Withdrawal request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process withdrawal request'
      });
    }
  }

  static validateWithdrawalRequest() {
    return [
      body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => {
          if (value <= 0) {
            throw new Error('Amount must be greater than 0');
          }
          if (value < 100) {
            throw new Error('Minimum withdrawal amount is ₹100');
          }
          return true;
        })
    ];
  }
}