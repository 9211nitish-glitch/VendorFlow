import { Request, Response } from 'express';
import { TaskModel } from '../models/Task';
import { PackageModel } from '../models/Package';
import { insertTaskSchema, TaskStatus, ApiResponse } from '@shared/schema';
import { AuthenticatedRequest } from '../middleware/auth';
import { validationResult, body } from 'express-validator';

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
}
