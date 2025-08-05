import cron from 'node-cron';
import { TaskModel } from '../models/Task';

export class CronService {
  static init() {
    // Run every 5 minutes to check for expired tasks
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Checking for expired tasks...');
        
        const expiredTasks = await TaskModel.getExpiredTasks();
        
        if (expiredTasks.length > 0) {
          const taskIds = expiredTasks.map(task => task.id);
          await TaskModel.markAsMissed(taskIds);
          
          console.log(`Marked ${expiredTasks.length} tasks as missed`);
        }
      } catch (error) {
        console.error('Error processing expired tasks:', error);
      }
    });

    console.log('Cron service initialized');
  }
}
