import { Request, Response } from 'express';
import { TaskModel } from '../models/Task';
import { PackageModel } from '../models/Package';
import { insertTaskSchema, TaskStatus, ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';
import { validationResult, body } from 'express-validator';
import { NotificationService } from '../services/notificationService';

export class TaskController {
  static validateCreateTask = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be at least 1 hour'),
    body('assignedTo').optional().isInt()
  ];

  static async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const taskData = insertTaskSchema.parse(req.body);
      const task = await TaskModel.create(taskData);

      const response: ApiResponse = {
        success: true,
        message: 'Task created successfully',
        data: task
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create task'
      });
    }
  }

  static async getAllTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const tasks = await TaskModel.getAll(offset, limit);

      const response: ApiResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks'
      });
    }
  }

  static async getVendorTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const status = req.query.status as TaskStatus;
      
      const tasks = await TaskModel.getByUserId(userId, status);

      const response: ApiResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get vendor tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks'
      });
    }
  }

  static async getAvailableTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const tasks = await TaskModel.getAvailableTasks(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Available tasks retrieved successfully',
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get available tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available tasks'
      });
    }
  }

  static async startTask(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if user can perform task action
      const canPerformTask = await PackageModel.canUserPerformAction(userId, 'task');
      if (!canPerformTask) {
        return res.status(400).json({
          success: false,
          message: 'Task limit exceeded or package expired'
        });
      }

      const success = await TaskModel.startTask(taskId, userId);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Task not available or already assigned'
        });
      }

      // Increment task usage
      await PackageModel.incrementTaskUsage(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Task started successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Start task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start task'
      });
    }
  }

  static async submitTask(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      const { submissionUrl, comments } = req.body;

      if (!submissionUrl) {
        return res.status(400).json({
          success: false,
          message: 'Submission URL is required'
        });
      }

      const success = await TaskModel.submitTask(taskId, submissionUrl, comments);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Task not found or not in progress'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Task submitted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Submit task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit task'
      });
    }
  }

  static async skipTask(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user!.id;

      // Check if user can skip
      const canSkip = await PackageModel.canUserPerformAction(userId, 'skip');
      if (!canSkip) {
        return res.status(400).json({
          success: false,
          message: 'Skip limit exceeded'
        });
      }

      // Update task status to available (unassign from user)
      const success = await TaskModel.updateStatus(taskId, TaskStatus.AVAILABLE);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Task not found'
        });
      }

      // Increment skip usage
      await PackageModel.incrementSkipUsage(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Task skipped successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Skip task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to skip task'
      });
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;

      if (!Object.values(TaskStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid task status'
        });
      }

      const success = await TaskModel.updateStatus(taskId, status);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Task status updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update task status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update task status'
      });
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);

      const success = await TaskModel.delete(taskId);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Task deleted successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;

      const success = await TaskModel.update(taskId, updates);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      const response: ApiResponse = {
        success: true,
        message: 'Task updated successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update task'
      });
    }
  }

  // Bulk Operations for Admins
  static validateBulkOperation = [
    body('taskIds').isArray({ min: 1 }).withMessage('Task IDs array is required'),
    body('taskIds.*').isInt().withMessage('Each task ID must be a number'),
    body('action').isIn(['approve', 'reject', 'delete', 'assign', 'status']).withMessage('Invalid bulk action')
  ];

  static async bulkOperation(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { taskIds, action, vendorId, status, rejectionReason } = req.body;
      let successCount = 0;
      let failedTasks: number[] = [];

      for (const taskId of taskIds) {
        try {
          switch (action) {
            case 'approve':
              const approveSuccess = await TaskModel.updateStatus(taskId, TaskStatus.COMPLETED);
              if (approveSuccess) {
                // Get task details for notification
                const task = await TaskModel.findById(taskId);
                if (task && task.assignedTo) {
                  await NotificationService.notifyTaskApproved(taskId, task.assignedTo, task.title);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;

            case 'reject':
              const rejectSuccess = await TaskModel.updateStatus(taskId, TaskStatus.REJECTED);
              if (rejectSuccess) {
                // Get task details for notification
                const task = await TaskModel.findById(taskId);
                if (task && task.assignedTo) {
                  await NotificationService.notifyTaskRejected(taskId, task.assignedTo, task.title, rejectionReason);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;

            case 'delete':
              const deleteSuccess = await TaskModel.delete(taskId);
              if (deleteSuccess) {
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;

            case 'assign':
              if (!vendorId) {
                failedTasks.push(taskId);
                continue;
              }
              const assignSuccess = await TaskModel.assignToVendor(taskId, vendorId);
              if (assignSuccess) {
                // Get task details for notification
                const task = await TaskModel.findById(taskId);
                if (task) {
                  await NotificationService.notifyTaskAssigned(taskId, vendorId, task.title);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;

            case 'status':
              if (!status || !Object.values(TaskStatus).includes(status)) {
                failedTasks.push(taskId);
                continue;
              }
              const statusSuccess = await TaskModel.updateStatus(taskId, status);
              if (statusSuccess) {
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;

            default:
              failedTasks.push(taskId);
          }
        } catch (error) {
          console.error(`Error processing bulk operation for task ${taskId}:`, error);
          failedTasks.push(taskId);
        }
      }

      const response: ApiResponse = {
        success: true,
        message: `Bulk operation completed. ${successCount} tasks processed successfully${failedTasks.length > 0 ? `, ${failedTasks.length} failed` : ''}`,
        data: {
          successCount,
          failedTasks,
          totalProcessed: taskIds.length
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Bulk operation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform bulk operation'
      });
    }
  }

  static async getTasksWithFilters(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        status,
        assignedTo,
        dateFrom,
        dateTo,
        search,
        page = 1,
        limit = 50
      } = req.query;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const tasks = await TaskModel.getWithFilters({
        status: status as TaskStatus,
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        search: search as string,
        offset,
        limit: parseInt(limit as string)
      });

      const response: ApiResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks
      };

      res.json(response);
    } catch (error) {
      console.error('Get filtered tasks error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks'
      });
    }
  }
}
