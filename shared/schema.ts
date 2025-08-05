import { z } from "zod";

// User Types
export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked'
}

export const insertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole).default(UserRole.VENDOR),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  referralCode: z.string(),
  referrerId: z.number().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  referralCode: string;
  referrerId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task Types
export enum TaskStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  mediaUrl: z.string().optional(),
  timeLimit: z.number().min(1, "Time limit must be at least 1 hour"),
  assignedTo: z.number().optional(),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;

export interface Task {
  id: number;
  title: string;
  description: string;
  mediaUrl?: string;
  timeLimit: number; // in hours
  assignedTo?: number;
  status: TaskStatus;
  startedAt?: Date;
  submittedAt?: Date;
  submissionUrl?: string;
  submissionComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Package Types
export enum PackageType {
  STARTER = 'starter',
  PRO = 'pro',
  PREMIUM = 'premium'
}

export interface Package {
  id: number;
  name: string;
  type: PackageType;
  taskLimit: number;
  skipLimit: number;
  validityDays: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPackage {
  id: number;
  userId: number;
  packageId: number;
  tasksUsed: number;
  skipsUsed: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Referral Types
export interface Referral {
  id: number;
  referrerId: number;
  referredId: number;
  level: number;
  commission: number;
  createdAt: Date;
}

// Payment Types
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export const insertPaymentSchema = z.object({
  userId: z.number(),
  packageId: z.number(),
  amount: z.number(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export interface Payment {
  id: number;
  userId: number;
  packageId: number;
  amount: number;
  status: PaymentStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface TaskSubmission {
  taskId: number;
  submissionUrl: string;
  comments?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  referralsByLevel: Record<number, number>;
}
