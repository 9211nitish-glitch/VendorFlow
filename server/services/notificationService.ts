import { WebSocket } from 'ws';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

interface ConnectedUser {
  userId: number;
  role: string;
  socket: WebSocket;
}

interface NotificationData {
  type: 'task_assigned' | 'task_approved' | 'task_rejected' | 'task_available' | 'task_expired' | 'referral_earned';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export class NotificationService {
  private static connectedUsers: Map<number, ConnectedUser> = new Map();

  static addConnection(userId: number, role: string, socket: WebSocket) {
    this.connectedUsers.set(userId, { userId, role, socket });
    console.log(`User ${userId} (${role}) connected to notifications`);

    socket.on('close', () => {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected from notifications`);
    });

    socket.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      this.connectedUsers.delete(userId);
    });
  }

  static async notifyUser(userId: number, notification: NotificationData) {
    const user = this.connectedUsers.get(userId);
    if (user && user.socket.readyState === WebSocket.OPEN) {
      try {
        user.socket.send(JSON.stringify({
          type: 'notification',
          data: notification
        }));

        // Store notification in database
        await this.storeNotification(userId, notification);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        this.connectedUsers.delete(userId);
      }
    }
  }

  static async notifyAllVendors(notification: NotificationData) {
    const vendors = Array.from(this.connectedUsers.values()).filter(user => user.role === 'vendor');
    
    for (const vendor of vendors) {
      if (vendor.socket.readyState === WebSocket.OPEN) {
        try {
          vendor.socket.send(JSON.stringify({
            type: 'notification',
            data: notification
          }));

          // Store notification in database
          await this.storeNotification(vendor.userId, notification);
        } catch (error) {
          console.error(`Failed to send notification to vendor ${vendor.userId}:`, error);
          this.connectedUsers.delete(vendor.userId);
        }
      }
    }
  }

  static async notifyTaskAssigned(taskId: number, vendorId: number, taskTitle: string) {
    const notification: NotificationData = {
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      data: { taskId },
      timestamp: new Date()
    };

    await this.notifyUser(vendorId, notification);
  }

  static async notifyTaskApproved(taskId: number, vendorId: number, taskTitle: string) {
    const notification: NotificationData = {
      type: 'task_approved',
      title: 'Task Approved',
      message: `Your task "${taskTitle}" has been approved!`,
      data: { taskId },
      timestamp: new Date()
    };

    await this.notifyUser(vendorId, notification);
  }

  static async notifyTaskRejected(taskId: number, vendorId: number, taskTitle: string, reason?: string) {
    const notification: NotificationData = {
      type: 'task_rejected',
      title: 'Task Rejected',
      message: `Your task "${taskTitle}" has been rejected${reason ? `: ${reason}` : ''}`,
      data: { taskId, reason },
      timestamp: new Date()
    };

    await this.notifyUser(vendorId, notification);
  }

  static async notifyNewTaskAvailable(taskTitle: string) {
    const notification: NotificationData = {
      type: 'task_available',
      title: 'New Task Available',
      message: `New task available: ${taskTitle}`,
      data: {},
      timestamp: new Date()
    };

    await this.notifyAllVendors(notification);
  }

  static async notifyTaskExpired(taskId: number, vendorId: number, taskTitle: string) {
    const notification: NotificationData = {
      type: 'task_expired',
      title: 'Task Expired',
      message: `Your task "${taskTitle}" has expired due to time limit`,
      data: { taskId },
      timestamp: new Date()
    };

    await this.notifyUser(vendorId, notification);
  }

  static async notifyReferralEarned(userId: number, amount: number, referredUser: string) {
    const notification: NotificationData = {
      type: 'referral_earned',
      title: 'Referral Commission Earned',
      message: `You earned ₹${amount} from ${referredUser}'s package purchase`,
      data: { amount, referredUser },
      timestamp: new Date()
    };

    await this.notifyUser(userId, notification);
  }

  private static async storeNotification(userId: number, notification: NotificationData) {
    try {
      const query = `
        INSERT INTO notifications (userId, type, title, message, data, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await pool.execute(query, [
        userId,
        notification.type,
        notification.title,
        notification.message,
        JSON.stringify(notification.data || {}),
        notification.timestamp
      ]);
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  static async getUserNotifications(userId: number, limit: number = 20): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE userId = ? 
        ORDER BY createdAt DESC 
        LIMIT ?
      `;
      
      const [rows] = await pool.execute<RowDataPacket[]>(query, [userId, limit]);
      
      return rows.map(row => ({
        ...row,
        data: JSON.parse(row.data || '{}')
      }));
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: number, userId: number) {
    try {
      const query = `UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?`;
      await pool.execute(query, [notificationId, userId]);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  static async markAllNotificationsAsRead(userId: number) {
    try {
      const query = `UPDATE notifications SET isRead = TRUE WHERE userId = ?`;
      await pool.execute(query, [userId]);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }
}