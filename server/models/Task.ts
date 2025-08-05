import { pool } from '../config/database';
import { Task, TaskStatus, InsertTask } from '@shared/schema';

export class TaskModel {
  static async findById(id: number): Promise<Task | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ?',
      [id]
    );
    const tasks = rows as Task[];
    return tasks[0] || null;
  }

  static async create(taskData: InsertTask): Promise<Task> {
    const [result] = await pool.execute(
      `INSERT INTO tasks (title, description, mediaUrl, timeLimit, assignedTo) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        taskData.title,
        taskData.description,
        taskData.mediaUrl || null,
        taskData.timeLimit,
        taskData.assignedTo || null
      ]
    );

    const insertResult = result as any;
    const newTask = await this.findById(insertResult.insertId);
    
    if (!newTask) {
      throw new Error('Failed to create task');
    }

    return newTask;
  }

  static async getAll(offset = 0, limit = 50): Promise<Task[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows as Task[];
  }

  static async getByUserId(userId: number, status?: TaskStatus): Promise<Task[]> {
    let query = 'SELECT * FROM tasks WHERE assignedTo = ?';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    const [rows] = await pool.execute(query, params);
    return rows as Task[];
  }

  static async getAvailableTasks(userId: number): Promise<Task[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM tasks 
       WHERE (assignedTo IS NULL OR assignedTo = ?) 
       AND status = ? 
       ORDER BY createdAt DESC`,
      [userId, TaskStatus.AVAILABLE]
    );
    return rows as Task[];
  }

  static async startTask(taskId: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET status = ?, assignedTo = ?, startedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = ?`,
      [TaskStatus.IN_PROGRESS, userId, taskId, TaskStatus.AVAILABLE]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async submitTask(taskId: number, submissionUrl: string, comments?: string): Promise<boolean> {
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET status = ?, submissionUrl = ?, submissionComments = ?, 
           submittedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = ?`,
      [TaskStatus.PENDING_REVIEW, submissionUrl, comments || null, taskId, TaskStatus.IN_PROGRESS]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async updateStatus(taskId: number, status: TaskStatus): Promise<boolean> {
    const [result] = await pool.execute(
      'UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, taskId]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }

  static async getExpiredTasks(): Promise<Task[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM tasks 
       WHERE status = ? 
       AND startedAt IS NOT NULL 
       AND TIMESTAMPDIFF(HOUR, startedAt, NOW()) >= timeLimit`,
      [TaskStatus.IN_PROGRESS]
    );
    return rows as Task[];
  }

  static async markAsMissed(taskIds: number[]): Promise<void> {
    if (taskIds.length === 0) return;

    const placeholders = taskIds.map(() => '?').join(',');
    await pool.execute(
      `UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [TaskStatus.MISSED, ...taskIds]
    );
  }

  static async delete(taskId: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ?',
      [taskId]
    );
    const deleteResult = result as any;
    return deleteResult.affectedRows > 0;
  }

  static async update(taskId: number, updates: Partial<InsertTask>): Promise<boolean> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const [result] = await pool.execute(
      `UPDATE tasks SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, taskId]
    );
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  }
}
