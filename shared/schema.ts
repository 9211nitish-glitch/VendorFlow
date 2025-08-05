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

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerSchema>;
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
  ONSITE = 'onsite',
  ONLINE = 'online'
}

export const insertPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  type: z.string().min(1, "Package type is required"),
  taskLimit: z.number().min(1, "Task limit must be at least 1"),
  skipLimit: z.number().min(0, "Skip limit cannot be negative"),
  validityDays: z.number().min(1, "Validity must be at least 1 day"),
  price: z.number().min(0, "Price cannot be negative"),
  dailyTaskLimit: z.number().min(0, "Daily task limit cannot be negative").default(0),
  soloEarn: z.number().min(0, "Solo earn cannot be negative").default(0),
  dualEarn: z.number().min(0, "Dual earn cannot be negative").default(0),
  earnTask: z.number().min(0, "Earn task cannot be negative").default(0),
  igLimitMin: z.string().default('0'),
  ytLimitMin: z.string().default('0'),
  kitBox: z.string().optional(),
  premiumSubscription: z.boolean().default(true),
  onsiteVideoVisit: z.boolean().default(false),
  pentaRefEarning: z.boolean().default(true),
  remoWork: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type InsertPackage = z.infer<typeof insertPackageSchema>;

export interface Package {
  id: number;
  name: string;
  type: string;
  taskLimit: number;
  skipLimit: number;
  validityDays: number;
  price: number;
  dailyTaskLimit: number;
  soloEarn: number;
  dualEarn: number;
  earnTask: number;
  igLimitMin: string;
  ytLimitMin: string;
  kitBox?: string;
  premiumSubscription: boolean;
  onsiteVideoVisit: boolean;
  pentaRefEarning: boolean;
  remoWork: boolean;
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
