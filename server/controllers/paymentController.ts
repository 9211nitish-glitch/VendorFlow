import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentModel } from '../models/Payment';
import { PackageModel } from '../models/Package';
import { ReferralModel } from '../models/Referral';
import { PaymentStatus, insertPaymentSchema, ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_OhqJDvzONAAemV',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Vjxjdug9chXaUYOsJmcMuOxs',
});

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { packageId } = req.body;
      const userId = req.user!.id;

      const packageInfo = await PackageModel.findById(packageId);
      if (!packageInfo) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      const options = {
        amount: Math.round(packageInfo.price * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${userId}_${packageId}_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          packageId: packageId.toString()
        }
      };

      const order = await razorpay.orders.create(options);

      // Create payment record
      await PaymentModel.create({
        userId,
        packageId,
        amount: packageInfo.price,
        razorpayOrderId: order.id,
        razorpayPaymentId: undefined,
        razorpaySignature: undefined
      });

      const response: ApiResponse = {
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID || 'rzp_live_OhqJDvzONAAemV'
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const userId = req.user!.id;

      // Verify signature
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Vjxjdug9chXaUYOsJmcMuOxs');
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Find payment record
      const payment = await PaymentModel.findByOrderId(razorpay_order_id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment record not found'
        });
      }

      // Update payment status
      await PaymentModel.updateStatus(payment.id, PaymentStatus.COMPLETED, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      // Create user package
      const userPackage = await PackageModel.createUserPackage(userId, payment.packageId);

      // Get package info for referral calculation
      const packageInfo = await PackageModel.findById(payment.packageId);
      if (packageInfo) {
        // Process referral commissions
        const user = await require('../models/User').UserModel.findById(userId);
        if (user && user.referrerId) {
          await ReferralModel.createReferralChain(user.referrerId, user.id, packageInfo.price);
        }
      }

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified and package activated successfully',
        data: {
          payment,
          userPackage
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  }

  static async getUserPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const payments = await PaymentModel.getUserPayments(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User payments retrieved successfully',
        data: payments
      };

      res.json(response);
    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user payments'
      });
    }
  }

  static async getAllPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const payments = await PaymentModel.getAllPayments(offset, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Payments retrieved successfully',
        data: payments
      };

      res.json(response);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments'
      });
    }
  }
}
