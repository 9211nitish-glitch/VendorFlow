import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import cors from 'cors';

interface MulterRequest extends Request {
  file?: any;
}
import { initializeDatabase } from './config/database';
import { CronService } from './services/cronService';

// Controllers
import { AuthController } from './controllers/authController';
import { TaskController } from './controllers/taskController';
import { UserController } from './controllers/userController';
import { PackageController } from './controllers/packageController';
import { ReferralController } from './controllers/referralController';
import { PaymentController } from './controllers/paymentController';
import { UserProfileController } from './controllers/userProfileController';
import { WalletController } from './controllers/walletController';
import { ProfileController } from './controllers/profileController';
import { NotificationService } from './services/notificationService';
import jwt from 'jsonwebtoken';

// Middleware
import { authenticateToken, requireAdmin, requireVendor } from './middleware/auth';
import { upload } from './middleware/upload';

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database
  await initializeDatabase();
  
  // Start cron service
  CronService.init();

  // CORS configuration
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-domain.com']
      : ['http://localhost:5000', 'http://localhost:3000'],
    credentials: true
  }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // Auth routes
  app.post('/api/auth/register', AuthController.validateRegister, AuthController.register);
  app.post('/api/auth/login', AuthController.validateLogin, AuthController.login);
  app.get('/api/auth/profile', authenticateToken, AuthController.getProfile);
  
  // Google OAuth routes
  app.get('/api/auth/google', AuthController.googleAuth);
  app.get('/api/auth/google/callback', AuthController.googleCallback);
  
  // Password reset routes
  app.post('/api/auth/forgot-password', AuthController.validateForgotPassword, AuthController.forgotPassword);
  app.post('/api/auth/reset-password', AuthController.validateResetPassword, AuthController.resetPassword);
  app.get('/api/auth/validate-reset-token', AuthController.validateResetToken);

  // Task routes
  app.get('/api/tasks', authenticateToken, TaskController.getAllTasks);
  app.get('/api/tasks/filtered', authenticateToken, requireAdmin, TaskController.getTasksWithFilters);
  app.post('/api/tasks', authenticateToken, requireAdmin, TaskController.validateCreateTask, TaskController.createTask);
  app.post('/api/tasks/bulk', authenticateToken, requireAdmin, TaskController.validateBulkOperation, TaskController.bulkOperation);
  app.get('/api/tasks/available', authenticateToken, requireVendor, TaskController.getAvailableTasks);
  app.get('/api/tasks/vendor', authenticateToken, requireVendor, TaskController.getVendorTasks);
  app.post('/api/tasks/:id/start', authenticateToken, requireVendor, TaskController.startTask);
  app.post('/api/tasks/:id/submit', authenticateToken, requireVendor, TaskController.submitTask);
  app.post('/api/tasks/:id/skip', authenticateToken, requireVendor, TaskController.skipTask);
  app.patch('/api/tasks/:id/status', authenticateToken, requireAdmin, TaskController.updateTaskStatus);
  app.put('/api/tasks/:id', authenticateToken, requireAdmin, TaskController.updateTask);
  app.delete('/api/tasks/:id', authenticateToken, requireAdmin, TaskController.deleteTask);

  // User routes
  app.get('/api/users', authenticateToken, requireAdmin, UserController.getAllUsers);
  app.get('/api/users/vendors', authenticateToken, requireAdmin, UserController.getVendors);
  app.get('/api/users/:id', authenticateToken, requireAdmin, UserController.getUserById);
  app.post('/api/users/:id/block', authenticateToken, requireAdmin, UserController.blockUser);
  app.post('/api/users/:id/unblock', authenticateToken, requireAdmin, UserController.unblockUser);
  app.get('/api/admin/stats', authenticateToken, requireAdmin, UserController.getDashboardStats);

  // Package routes
  app.get('/api/packages', authenticateToken, PackageController.getAllPackages);
  app.get('/api/packages/:id', authenticateToken, PackageController.getPackageById);
  app.get('/api/user/package', authenticateToken, PackageController.getUserPackage);
  app.get('/api/user/limits', authenticateToken, PackageController.checkUserLimits);
  
  // Admin package management routes
  app.post('/api/admin/packages', authenticateToken, requireAdmin, PackageController.createPackage);
  app.put('/api/admin/packages/:id', authenticateToken, requireAdmin, PackageController.updatePackage);
  app.delete('/api/admin/packages/:id', authenticateToken, requireAdmin, PackageController.deletePackage);

  // Referral routes
  app.get('/api/referrals/stats', authenticateToken, ReferralController.getReferralStats);
  app.get('/api/referrals/mine', authenticateToken, ReferralController.getUserReferrals);
  app.get('/api/referrals/top', authenticateToken, requireAdmin, ReferralController.getTopReferrers);
  app.get('/api/admin/referrals/stats', authenticateToken, requireAdmin, ReferralController.getReferralSystemStats);

  // User Profile routes
  app.get('/api/user/profile', authenticateToken, UserProfileController.getProfile);
  app.put('/api/user/profile', authenticateToken, ProfileController.validateUpdateProfile, ProfileController.updateProfile);
  app.post('/api/user/profile/photo', authenticateToken, upload.single('photo'), ProfileController.uploadProfilePhoto);

  // Wallet routes
  app.get('/api/wallet/balance', authenticateToken, WalletController.getWalletBalance);
  app.get('/api/wallet/transactions', authenticateToken, WalletController.getWalletTransactions);
  app.post('/api/wallet/withdraw', authenticateToken, WalletController.requestWithdrawal);

  // Payment routes
  app.post('/api/payments/create-order', authenticateToken, PaymentController.createOrder);
  app.post('/api/payments/verify', authenticateToken, PaymentController.verifyPayment);
  app.get('/api/payments/mine', authenticateToken, PaymentController.getUserPayments);
  app.get('/api/payments', authenticateToken, requireAdmin, PaymentController.getAllPayments);

  // File upload routes
  app.post('/api/upload', authenticateToken, upload.single('file'), (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed'
      });
    }
  });

  // Notification routes
  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const notifications = await NotificationService.getUserNotifications(userId, limit);
      
      res.json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);
      
      await NotificationService.markNotificationAsRead(notificationId, userId);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  app.put('/api/notifications/read-all', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      await NotificationService.markAllNotificationsAsRead(userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads/'));

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection attempt');
    
    // Extract token from query parameters or headers
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify JWT token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NitishTrytohard@22000') as any;
      
      // Add user to notification service
      NotificationService.addConnection(decoded.id, decoded.role, ws);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to notifications'
      }));
      
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Invalid token');
    }
  });

  return httpServer;
}
