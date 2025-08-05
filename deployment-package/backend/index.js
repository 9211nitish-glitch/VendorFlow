var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/config/database.ts
var database_exports = {};
__export(database_exports, {
  initializeDatabase: () => initializeDatabase,
  pool: () => pool
});
import mysql from "mysql2/promise";
async function initializeDatabase() {
  try {
    await createTables();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}
async function createTables() {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role ENUM('admin', 'vendor') DEFAULT 'vendor',
        status ENUM('active', 'blocked') DEFAULT 'active',
        referralCode VARCHAR(8) UNIQUE NOT NULL,
        referrerId INT NULL,
        googleId VARCHAR(100) UNIQUE NULL,
        resetPasswordToken VARCHAR(100) NULL,
        resetPasswordExpires TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referrerId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    await connection.execute(`DROP TABLE IF EXISTS packages`);
    await connection.execute(`
      CREATE TABLE packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        taskLimit INT NOT NULL,
        skipLimit INT NOT NULL,
        validityDays INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        dailyTaskLimit INT DEFAULT 0,
        soloEarn DECIMAL(10,2) DEFAULT 0,
        dualEarn DECIMAL(10,2) DEFAULT 0,
        earnTask DECIMAL(10,2) DEFAULT 0,
        igLimitMin VARCHAR(20) DEFAULT '0',
        ytLimitMin VARCHAR(20) DEFAULT '0',
        kitBox VARCHAR(100) DEFAULT NULL,
        premiumSubscription BOOLEAN DEFAULT TRUE,
        onsiteVideoVisit BOOLEAN DEFAULT FALSE,
        pentaRefEarning BOOLEAN DEFAULT TRUE,
        remoWork BOOLEAN DEFAULT FALSE,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        packageId INT NOT NULL,
        tasksUsed INT DEFAULT 0,
        skipsUsed INT DEFAULT 0,
        expiresAt TIMESTAMP NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE CASCADE
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        mediaUrl VARCHAR(500) NULL,
        timeLimit INT NOT NULL,
        assignedTo INT NULL,
        status ENUM('available', 'in_progress', 'completed', 'missed', 'pending_review', 'approved', 'rejected') DEFAULT 'available',
        startedAt TIMESTAMP NULL,
        submittedAt TIMESTAMP NULL,
        submissionUrl VARCHAR(500) NULL,
        submissionComments TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrerId INT NOT NULL,
        referredId INT NOT NULL,
        level INT NOT NULL,
        commission DECIMAL(10,2) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (referrerId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (referredId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        packageId INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        razorpayOrderId VARCHAR(255) NOT NULL,
        razorpayPaymentId VARCHAR(255) NULL,
        razorpaySignature VARCHAR(255) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE CASCADE
      )
    `);
    await connection.execute(`
      INSERT IGNORE INTO packages (
        id, name, type, taskLimit, skipLimit, validityDays, price, 
        dailyTaskLimit, soloEarn, dualEarn, earnTask, igLimitMin, ytLimitMin, 
        kitBox, premiumSubscription, onsiteVideoVisit, pentaRefEarning, remoWork
      ) VALUES
      (1, 'New Star Bundle', 'onsite', 25, 25, 365, 4999.00, 0, 400.00, 500.00, 0.00, '0', '0', NULL, TRUE, TRUE, TRUE, FALSE),
      (2, 'Rising Star Starter', 'onsite', 50, 50, 365, 9999.00, 0, 500.00, 600.00, 0.00, '0', '0', 'Entry Level', TRUE, TRUE, TRUE, FALSE),
      (3, 'Shining Star Pack', 'onsite', 50, 50, 365, 19999.00, 0, 1000.00, 1200.00, 0.00, '20k+', '10k+', 'Growth Stage', TRUE, TRUE, TRUE, FALSE),
      (4, 'Superstar Elite Plan', 'onsite', 50, 50, 365, 34999.00, 0, 1800.00, 2000.00, 0.00, '100k+', '50k+', 'Advance Level', TRUE, TRUE, TRUE, FALSE),
      (5, 'Legendary Star Package', 'onsite', 50, 50, 365, 49999.00, 0, 2500.00, 3000.00, 0.00, '1M+', '100k+', 'Ultimate Star', TRUE, TRUE, TRUE, FALSE),
      (6, 'Fresh Face Trial', 'online', 10, 10, 30, 1100.00, 0, 0.00, 0.00, 300.00, '0', '0', NULL, TRUE, FALSE, TRUE, TRUE),
      (7, 'Fresh Face Star', 'online', 150, 150, 365, 4999.00, 0, 0.00, 0.00, 100.00, '0', '0', NULL, TRUE, FALSE, TRUE, TRUE),
      (8, 'Next Level Creator', 'online', 365, 365, 365, 9999.00, 1, 0.00, 0.00, 100.00, '0', '0', 'Entry Level', TRUE, FALSE, TRUE, TRUE),
      (9, 'Influence Empire', 'online', 365, 365, 365, 19999.00, 2, 0.00, 0.00, 100.00, '0', '0', 'Growth Stage', TRUE, FALSE, TRUE, TRUE),
      (10, 'SuperStar Pro Package', 'online', 365, 365, 365, 34999.00, 4, 0.00, 0.00, 100.00, '0', '0', 'Advance Level', TRUE, FALSE, TRUE, TRUE),
      (11, 'Legendary Creator Kit', 'online', 365, 365, 365, 49999.00, 1, 0.00, 0.00, 500.00, '0', '0', 'Ultimate Star', TRUE, FALSE, TRUE, TRUE)
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        phone VARCHAR(20),
        bio TEXT,
        location VARCHAR(255),
        contentCreatorType VARCHAR(50),
        socialLinks JSON,
        profilePhoto VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_created (userId, createdAt),
        INDEX idx_user_unread (userId, isRead)
      )
    `);
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);
  } finally {
    connection.release();
  }
}
var dbConfig, pool;
var init_database = __esm({
  "server/config/database.ts"() {
    "use strict";
    dbConfig = {
      host: process.env.DB_HOST || "swift.herosite.pro",
      user: process.env.DB_USER || "starsflock",
      password: process.env.DB_PASSWORD || "Nitish@123",
      database: process.env.DB_NAME || "instarsflock",
      port: parseInt(process.env.DB_PORT || "3306"),
      connectionLimit: 10,
      acquireTimeout: 6e4,
      timeout: 6e4
    };
    pool = mysql.createPool(dbConfig);
  }
});

// shared/schema.ts
import { z } from "zod";
var UserRole, UserStatus, insertUserSchema, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, TaskStatus, insertTaskSchema, insertPackageSchema, insertPaymentSchema, updateProfileSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    UserRole = /* @__PURE__ */ ((UserRole2) => {
      UserRole2["ADMIN"] = "admin";
      UserRole2["VENDOR"] = "vendor";
      return UserRole2;
    })(UserRole || {});
    UserStatus = /* @__PURE__ */ ((UserStatus2) => {
      UserStatus2["ACTIVE"] = "active";
      UserStatus2["BLOCKED"] = "blocked";
      return UserStatus2;
    })(UserStatus || {});
    insertUserSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      role: z.nativeEnum(UserRole).default("vendor" /* VENDOR */),
      status: z.nativeEnum(UserStatus).default("active" /* ACTIVE */),
      referralCode: z.string(),
      referrerId: z.number().optional()
    });
    registerSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      referralCode: z.string().optional()
    });
    loginSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required")
    });
    forgotPasswordSchema = z.object({
      email: z.string().email("Invalid email address")
    });
    resetPasswordSchema = z.object({
      token: z.string().min(1, "Reset token is required"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });
    TaskStatus = /* @__PURE__ */ ((TaskStatus2) => {
      TaskStatus2["AVAILABLE"] = "available";
      TaskStatus2["IN_PROGRESS"] = "in_progress";
      TaskStatus2["COMPLETED"] = "completed";
      TaskStatus2["MISSED"] = "missed";
      TaskStatus2["PENDING_REVIEW"] = "pending_review";
      TaskStatus2["APPROVED"] = "approved";
      TaskStatus2["REJECTED"] = "rejected";
      return TaskStatus2;
    })(TaskStatus || {});
    insertTaskSchema = z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      mediaUrl: z.string().optional(),
      timeLimit: z.number().min(1, "Time limit must be at least 1 hour"),
      assignedTo: z.number().optional()
    });
    insertPackageSchema = z.object({
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
      igLimitMin: z.string().default("0"),
      ytLimitMin: z.string().default("0"),
      kitBox: z.string().optional(),
      premiumSubscription: z.boolean().default(true),
      onsiteVideoVisit: z.boolean().default(false),
      pentaRefEarning: z.boolean().default(true),
      remoWork: z.boolean().default(false),
      isActive: z.boolean().default(true)
    });
    insertPaymentSchema = z.object({
      userId: z.number(),
      packageId: z.number(),
      amount: z.number(),
      razorpayOrderId: z.string(),
      razorpayPaymentId: z.string().optional(),
      razorpaySignature: z.string().optional()
    });
    updateProfileSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
      phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
      profilePhoto: z.string().optional(),
      bankAccountName: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankIfscCode: z.string().optional(),
      bankName: z.string().optional(),
      upiId: z.string().optional()
    });
  }
});

// server/models/User.ts
var User_exports = {};
__export(User_exports, {
  UserModel: () => UserModel
});
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
var UserModel;
var init_User = __esm({
  "server/models/User.ts"() {
    "use strict";
    init_database();
    init_schema();
    UserModel = class {
      static async findById(id) {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE id = ?",
          [id]
        );
        const users = rows;
        return users[0] || null;
      }
      static async findByEmail(email) {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );
        const users = rows;
        return users[0] || null;
      }
      static async findByReferralCode(referralCode) {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE referralCode = ?",
          [referralCode]
        );
        const users = rows;
        return users[0] || null;
      }
      static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const [countResult] = await pool.execute("SELECT COUNT(*) as count FROM users");
        const count = countResult[0].count;
        const role = count === 0 ? "admin" /* ADMIN */ : userData.role || "vendor" /* VENDOR */;
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, password, role, status, referralCode, referrerId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.name,
            userData.email,
            hashedPassword,
            role,
            userData.status || "active" /* ACTIVE */,
            userData.referralCode,
            userData.referrerId || null
          ]
        );
        const insertResult = result;
        const newUser = await this.findById(insertResult.insertId);
        if (!newUser) {
          throw new Error("Failed to create user");
        }
        if (role === "vendor" /* VENDOR */) {
          await this.assignStarterPackage(newUser.id);
        }
        return newUser;
      }
      static async createFromRegistration(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const referralCode = nanoid(8);
        const [countResult] = await pool.execute("SELECT COUNT(*) as count FROM users");
        const count = countResult[0].count;
        const role = count === 0 ? "admin" /* ADMIN */ : "vendor" /* VENDOR */;
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, password, role, status, referralCode, referrerId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.name,
            userData.email,
            hashedPassword,
            role,
            "active" /* ACTIVE */,
            referralCode,
            userData.referrerId || null
          ]
        );
        const insertResult = result;
        const newUser = await this.findById(insertResult.insertId);
        if (!newUser) {
          throw new Error("Failed to create user");
        }
        if (role === "vendor" /* VENDOR */) {
          await this.assignStarterPackage(newUser.id);
        }
        return newUser;
      }
      static async updateStatus(id, status) {
        const [result] = await pool.execute(
          "UPDATE users SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
          [status, id]
        );
        const updateResult = result;
        return updateResult.affectedRows > 0;
      }
      static async getAll(offset = 0, limit = 50) {
        const [rows] = await pool.execute(
          "SELECT * FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?",
          [limit, offset]
        );
        return rows;
      }
      static async getVendors() {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE role = ? ORDER BY name ASC",
          ["vendor" /* VENDOR */]
        );
        return rows;
      }
      static async assignStarterPackage(userId) {
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
        await pool.execute(
          `INSERT INTO user_packages (userId, packageId, expiresAt) VALUES (?, 1, ?)`,
          [userId, expiresAt]
        );
      }
      static async validatePassword(user, password) {
        if (!user.password) return false;
        return bcrypt.compare(password, user.password);
      }
      // Google OAuth methods
      static async findByGoogleId(googleId) {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE googleId = ?",
          [googleId]
        );
        const users = rows;
        return users[0] || null;
      }
      static async linkGoogleAccount(userId, googleId) {
        await pool.execute(
          "UPDATE users SET googleId = ? WHERE id = ?",
          [googleId, userId]
        );
      }
      static async createFromGoogle(userData) {
        const [countResult] = await pool.execute("SELECT COUNT(*) as count FROM users");
        const count = countResult[0].count;
        const role = count === 0 ? "admin" /* ADMIN */ : userData.role || "vendor" /* VENDOR */;
        let hashedPassword = null;
        if (userData.password) {
          hashedPassword = await bcrypt.hash(userData.password, 12);
        }
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, password, role, status, referralCode, referrerId, googleId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userData.name,
            userData.email,
            hashedPassword,
            role,
            userData.status || "active" /* ACTIVE */,
            userData.referralCode,
            userData.referrerId || null,
            userData.googleId || null
          ]
        );
        const insertResult = result;
        const newUser = await this.findById(insertResult.insertId);
        if (!newUser) {
          throw new Error("Failed to create user");
        }
        if (role === "vendor" /* VENDOR */) {
          await this.assignStarterPackage(newUser.id);
        }
        return newUser;
      }
      // Password reset methods
      static async findByPasswordResetToken(token) {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE resetPasswordToken = ?",
          [token]
        );
        const users = rows;
        return users[0] || null;
      }
      static async setPasswordResetToken(userId, token, expires) {
        await pool.execute(
          "UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?",
          [token, expires, userId]
        );
      }
      static async updatePassword(userId, hashedPassword) {
        await pool.execute(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId]
        );
      }
      static async clearPasswordResetToken(userId) {
        await pool.execute(
          "UPDATE users SET resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?",
          [userId]
        );
      }
      static async updateProfile(userId, updateData) {
        const fields = Object.keys(updateData).filter((key) => updateData[key] !== void 0);
        if (fields.length === 0) return;
        const setClause = fields.map((field) => {
          const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
          return `${dbField} = ?`;
        }).join(", ");
        const values = fields.map((field) => updateData[field]);
        values.push(userId);
        await pool.execute(
          `UPDATE users SET ${setClause} WHERE id = ?`,
          values
        );
      }
      // Alias methods for backward compatibility
      static async updateResetToken(userId, resetToken) {
        await this.setPasswordResetToken(userId, resetToken, new Date(Date.now() + 60 * 60 * 1e3));
      }
      static async clearResetToken(userId) {
        await this.clearPasswordResetToken(userId);
      }
    };
  }
});

// server/services/userService.ts
var UserService, userService;
var init_userService = __esm({
  "server/services/userService.ts"() {
    "use strict";
    init_User();
    UserService = class {
      static async findByEmail(email) {
        return UserModel.findByEmail(email);
      }
      static async findByGoogleId(googleId) {
        return UserModel.findByGoogleId(googleId);
      }
      static async findByPasswordResetToken(token) {
        return UserModel.findByPasswordResetToken(token);
      }
      static async linkGoogleAccount(userId, googleId) {
        await UserModel.linkGoogleAccount(userId, googleId);
      }
      static async create(userData) {
        return UserModel.createFromGoogle(userData);
      }
      static async setPasswordResetToken(userId, token, expires) {
        await UserModel.setPasswordResetToken(userId, token, expires);
      }
      static async updatePassword(userId, hashedPassword) {
        await UserModel.updatePassword(userId, hashedPassword);
      }
      static async clearPasswordResetToken(userId) {
        await UserModel.clearPasswordResetToken(userId);
      }
    };
    userService = UserService;
  }
});

// server/utils/referralUtils.ts
import { nanoid as nanoid2 } from "nanoid";
async function generateReferralCode() {
  let referralCode;
  let isUnique = false;
  do {
    referralCode = nanoid2(8);
    const existingUser = await UserModel.findByReferralCode(referralCode);
    isUnique = !existingUser;
  } while (!isUnique);
  return referralCode;
}
var init_referralUtils = __esm({
  "server/utils/referralUtils.ts"() {
    "use strict";
    init_User();
  }
});

// server/services/googleAuthService.ts
var googleAuthService_exports = {};
__export(googleAuthService_exports, {
  GoogleAuthService: () => GoogleAuthService
});
import { OAuth2Client } from "google-auth-library";
var client, GoogleAuthService;
var init_googleAuthService = __esm({
  "server/services/googleAuthService.ts"() {
    "use strict";
    init_userService();
    init_referralUtils();
    init_schema();
    client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NODE_ENV === "production" ? `https://${process.env.REPLIT_DOMAINS?.split(",")[0] || "your-domain.com"}/api/auth/google/callback` : "http://localhost:5000/api/auth/google/callback"
    );
    GoogleAuthService = class {
      static async getAuthUrl() {
        const authUrl = client.generateAuthUrl({
          access_type: "offline",
          scope: ["email", "profile"],
          prompt: "consent"
        });
        return authUrl;
      }
      static async verifyGoogleToken(code) {
        try {
          const { tokens } = await client.getToken(code);
          client.setCredentials(tokens);
          const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
          });
          const payload = ticket.getPayload();
          if (!payload) {
            throw new Error("Invalid Google token");
          }
          return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
          };
        } catch (error) {
          console.error("Google auth verification error:", error);
          throw new Error("Failed to verify Google token");
        }
      }
      static async handleGoogleAuth(googleData) {
        try {
          let user = await userService.findByGoogleId(googleData.googleId);
          if (user) {
            return user;
          }
          user = await userService.findByEmail(googleData.email);
          if (user) {
            await userService.linkGoogleAccount(user.id, googleData.googleId);
            return { ...user, googleId: googleData.googleId };
          }
          const referralCode = await generateReferralCode();
          const newUser = await userService.create({
            name: googleData.name,
            email: googleData.email,
            googleId: googleData.googleId,
            role: "vendor" /* VENDOR */,
            status: "active" /* ACTIVE */,
            referralCode
          });
          return newUser;
        } catch (error) {
          console.error("Google auth handling error:", error);
          throw new Error("Failed to handle Google authentication");
        }
      }
    };
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_database();
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

// server/services/cronService.ts
import cron from "node-cron";
var CronService = class {
  static init() {
    cron.schedule("*/5 * * * *", async () => {
      try {
        console.log("Checking for expired tasks...");
      } catch (error) {
        console.error("Error processing expired tasks:", error);
      }
    });
    console.log("Cron service initialized");
  }
};

// server/controllers/authController.ts
init_User();
init_schema();
import { body, validationResult } from "express-validator";
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var AuthController = class {
  // Registration validation middleware
  static validateRegister = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("referralCode").optional().trim()
  ];
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const userData = registerSchema.parse(req.body);
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }
      let referrerId;
      if (userData.referralCode) {
        const referrer = await UserModel.findByReferralCode(userData.referralCode);
        if (!referrer) {
          return res.status(400).json({
            success: false,
            message: "Invalid referral code"
          });
        }
        referrerId = referrer.id;
      }
      const user = await UserModel.createFromRegistration({
        ...userData,
        referrerId
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "NitishTrytohard@22000",
        { expiresIn: "7d" }
      );
      const response = {
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            referralCode: user.referralCode,
            referrerId: user.referrerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed"
      });
    }
  }
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const { email, password } = loginSchema.parse(req.body);
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
      if (user.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Account is blocked. Please contact support."
        });
      }
      const isValidPassword = await bcrypt2.compare(password, user.password || "");
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "NitishTrytohard@22000",
        { expiresIn: "7d" }
      );
      const response = {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            referralCode: user.referralCode,
            referrerId: user.referrerId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          },
          token
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed"
      });
    }
  }
  // Login validation middleware
  static validateLogin = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ];
  static async getProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const response = {
        success: true,
        message: "Profile retrieved successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          referrerId: user.referrerId,
          googleId: user.googleId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve profile"
      });
    }
  }
  // Google OAuth Routes
  static async googleAuth(req, res) {
    try {
      const { GoogleAuthService: GoogleAuthService2 } = await Promise.resolve().then(() => (init_googleAuthService(), googleAuthService_exports));
      const authUrl = await GoogleAuthService2.getAuthUrl();
      res.json({
        success: true,
        message: "Google auth URL generated",
        data: { authUrl }
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate Google auth URL"
      });
    }
  }
  static async googleCallback(req, res) {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.status(400).json({
          success: false,
          message: "Authorization code is required"
        });
      }
      const { GoogleAuthService: GoogleAuthService2 } = await Promise.resolve().then(() => (init_googleAuthService(), googleAuthService_exports));
      const googleData = await GoogleAuthService2.verifyGoogleToken(code);
      const user = await GoogleAuthService2.handleGoogleAuth(googleData);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "NitishTrytohard@22000",
        { expiresIn: "7d" }
      );
      const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google callback error:", error);
      const errorUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/auth/error?message=Google authentication failed`;
      res.redirect(errorUrl);
    }
  }
  // Forgot Password Routes
  static validateForgotPassword = [
    body("email").isEmail().withMessage("Valid email is required")
  ];
  static async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.json({
          success: true,
          message: "If the email exists, a reset link has been sent"
        });
      }
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "NitishTrytohard@22000",
        { expiresIn: "1h" }
      );
      await UserModel.updateResetToken(user.id, resetToken);
      res.json({
        success: true,
        message: "Password reset link sent to your email",
        data: { resetToken }
        // Remove this in production
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process forgot password request"
      });
    }
  }
  static validateResetPassword = [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ];
  static async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const { token, password } = resetPasswordSchema.parse(req.body);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "NitishTrytohard@22000");
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token"
          });
        }
        const hashedPassword = await bcrypt2.hash(password, 12);
        await UserModel.updatePassword(user.id, hashedPassword);
        res.json({
          success: true,
          message: "Password reset successful"
        });
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password"
      });
    }
  }
  static async validateResetToken(req, res) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({
          success: false,
          message: "Reset token is required"
        });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "NitishTrytohard@22000");
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token"
          });
        }
        res.json({
          success: true,
          message: "Reset token is valid"
        });
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token"
        });
      }
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to validate reset token"
      });
    }
  }
};

// server/models/Task.ts
init_database();
init_schema();
var TaskModel = class {
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );
    const tasks = rows;
    return tasks[0] || null;
  }
  static async getById(id) {
    return this.findById(id);
  }
  static async create(taskData) {
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
    const insertResult = result;
    const newTask = await this.findById(insertResult.insertId);
    if (!newTask) {
      throw new Error("Failed to create task");
    }
    return newTask;
  }
  static async getAll(offset = 0, limit = 50) {
    const [rows] = await pool.execute(
      "SELECT * FROM tasks ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows;
  }
  static async getByUserId(userId, status) {
    let query = "SELECT * FROM tasks WHERE assignedTo = ?";
    const params = [userId];
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    query += " ORDER BY createdAt DESC";
    const [rows] = await pool.execute(query, params);
    return rows;
  }
  static async getAvailableTasks(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM tasks 
       WHERE (assignedTo IS NULL OR assignedTo = ?) 
       AND status = ? 
       ORDER BY createdAt DESC`,
      [userId, "available" /* AVAILABLE */]
    );
    return rows;
  }
  static async startTask(taskId, userId) {
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET status = ?, assignedTo = ?, startedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = ?`,
      ["in_progress" /* IN_PROGRESS */, userId, taskId, "available" /* AVAILABLE */]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async submitTask(taskId, submissionUrl, comments) {
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET status = ?, submissionUrl = ?, submissionComments = ?, 
           submittedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = ?`,
      ["pending_review" /* PENDING_REVIEW */, submissionUrl, comments || null, taskId, "in_progress" /* IN_PROGRESS */]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async updateStatus(taskId, status) {
    const [result] = await pool.execute(
      "UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, taskId]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async getExpiredTasks() {
    const [rows] = await pool.execute(
      `SELECT * FROM tasks 
       WHERE status = ? 
       AND startedAt IS NOT NULL 
       AND TIMESTAMPDIFF(HOUR, startedAt, NOW()) >= timeLimit`,
      ["in_progress" /* IN_PROGRESS */]
    );
    return rows;
  }
  static async markAsMissed(taskIds) {
    if (taskIds.length === 0) return;
    const placeholders = taskIds.map(() => "?").join(",");
    await pool.execute(
      `UPDATE tasks SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      ["missed" /* MISSED */, ...taskIds]
    );
  }
  static async delete(taskId) {
    const [result] = await pool.execute(
      "DELETE FROM tasks WHERE id = ?",
      [taskId]
    );
    const deleteResult = result;
    return deleteResult.affectedRows > 0;
  }
  static async update(taskId, updates) {
    const fields = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updates);
    const [result] = await pool.execute(
      `UPDATE tasks SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, taskId]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async assignToVendor(taskId, vendorId) {
    const [result] = await pool.execute(
      `UPDATE tasks 
       SET assignedTo = ?, status = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ? AND status = ?`,
      [vendorId, "available" /* AVAILABLE */, taskId, "available" /* AVAILABLE */]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async getWithFilters(filters) {
    let query = `
      SELECT t.*, u.name as assignedToName, u.email as assignedToEmail
      FROM tasks t
      LEFT JOIN users u ON t.assignedTo = u.id
      WHERE 1=1
    `;
    const params = [];
    if (filters.status) {
      query += " AND t.status = ?";
      params.push(filters.status);
    }
    if (filters.assignedTo) {
      query += " AND t.assignedTo = ?";
      params.push(filters.assignedTo);
    }
    if (filters.dateFrom) {
      query += " AND DATE(t.createdAt) >= ?";
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      query += " AND DATE(t.createdAt) <= ?";
      params.push(filters.dateTo);
    }
    if (filters.search) {
      query += " AND (t.title LIKE ? OR t.description LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    query += " ORDER BY t.createdAt DESC LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset);
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

// server/models/Package.ts
init_database();
var PackageModel = class {
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM packages WHERE id = ?",
      [id]
    );
    const packages = rows;
    return packages[0] || null;
  }
  static async getAll() {
    const [rows] = await pool.execute(
      "SELECT * FROM packages WHERE isActive = TRUE ORDER BY price ASC"
    );
    return rows;
  }
  static async getUserPackage(userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM user_packages 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW() 
       ORDER BY createdAt DESC LIMIT 1`,
      [userId]
    );
    const userPackages = rows;
    return userPackages[0] || null;
  }
  static async createUserPackage(userId, packageId) {
    await pool.execute(
      "UPDATE user_packages SET isActive = FALSE WHERE userId = ?",
      [userId]
    );
    const packageInfo = await this.findById(packageId);
    if (!packageInfo) {
      throw new Error("Package not found");
    }
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + packageInfo.validityDays);
    const [result] = await pool.execute(
      `INSERT INTO user_packages (userId, packageId, expiresAt) VALUES (?, ?, ?)`,
      [userId, packageId, expiresAt]
    );
    const insertResult = result;
    const [newPackageRows] = await pool.execute(
      "SELECT * FROM user_packages WHERE id = ?",
      [insertResult.insertId]
    );
    const newPackages = newPackageRows;
    return newPackages[0];
  }
  static async incrementTaskUsage(userId) {
    const [result] = await pool.execute(
      `UPDATE user_packages 
       SET tasksUsed = tasksUsed + 1, updatedAt = CURRENT_TIMESTAMP 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW()`,
      [userId]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async incrementSkipUsage(userId) {
    const [result] = await pool.execute(
      `UPDATE user_packages 
       SET skipsUsed = skipsUsed + 1, updatedAt = CURRENT_TIMESTAMP 
       WHERE userId = ? AND isActive = TRUE AND expiresAt > NOW()`,
      [userId]
    );
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async canUserPerformAction(userId, actionType) {
    const [rows] = await pool.execute(
      `SELECT up.*, p.taskLimit, p.skipLimit 
       FROM user_packages up 
       JOIN packages p ON up.packageId = p.id 
       WHERE up.userId = ? AND up.isActive = TRUE AND up.expiresAt > NOW() 
       LIMIT 1`,
      [userId]
    );
    const userPackages = rows;
    if (!userPackages.length) return false;
    const userPackage = userPackages[0];
    if (actionType === "task") {
      return userPackage.tasksUsed < userPackage.taskLimit;
    } else if (actionType === "skip") {
      if (userPackage.skipsUsed >= userPackage.skipLimit) {
        return userPackage.tasksUsed < userPackage.taskLimit;
      }
      return true;
    }
    return false;
  }
  static async getUserPackageWithDetails(userId) {
    const [rows] = await pool.execute(
      `SELECT up.*, p.name as packageName, p.taskLimit, p.skipLimit, p.validityDays, p.price,
              DATEDIFF(up.expiresAt, NOW()) as daysLeft
       FROM user_packages up 
       JOIN packages p ON up.packageId = p.id 
       WHERE up.userId = ? AND up.isActive = TRUE AND up.expiresAt > NOW() 
       ORDER BY up.createdAt DESC LIMIT 1`,
      [userId]
    );
    const result = rows;
    if (!result.length) return null;
    const userPackage = result[0];
    return {
      ...userPackage,
      packageDetails: {
        name: userPackage.packageName,
        taskLimit: userPackage.taskLimit,
        skipLimit: userPackage.skipLimit,
        validityDays: userPackage.validityDays,
        price: userPackage.price
      },
      tasksRemaining: Math.max(0, userPackage.taskLimit - userPackage.tasksUsed),
      skipsRemaining: Math.max(0, userPackage.skipLimit - userPackage.skipsUsed),
      daysLeft: Math.max(0, userPackage.daysLeft)
    };
  }
  static async create(packageData) {
    const [result] = await pool.execute(
      `INSERT INTO packages (
        name, type, taskLimit, skipLimit, validityDays, price, 
        dailyTaskLimit, soloEarn, dualEarn, earnTask, igLimitMin, ytLimitMin,
        kitBox, premiumSubscription, onsiteVideoVisit, pentaRefEarning, remoWork, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        packageData.name || "New Package",
        packageData.type || "Onsite",
        packageData.taskLimit || 10,
        packageData.skipLimit || 5,
        packageData.validityDays || 30,
        packageData.price || 1e3,
        packageData.dailyTaskLimit || 3,
        packageData.soloEarn || 10,
        packageData.dualEarn || 20,
        packageData.earnTask || 30,
        packageData.igLimitMin || 1,
        packageData.ytLimitMin || 2,
        packageData.kitBox || 0,
        packageData.premiumSubscription || 0,
        packageData.onsiteVideoVisit || 0,
        packageData.pentaRefEarning || 0,
        packageData.remoWork || 0,
        packageData.isActive || 1
      ]
    );
    const insertResult = result;
    const newPackage = await this.findById(insertResult.insertId);
    if (!newPackage) {
      throw new Error("Failed to create package");
    }
    return newPackage;
  }
  static async update(id, packageData) {
    const existingPackage = await this.findById(id);
    if (!existingPackage) {
      return null;
    }
    const updateFields = [];
    const updateValues = [];
    Object.entries(packageData).forEach(([key, value]) => {
      if (value !== void 0) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });
    if (updateFields.length === 0) {
      return existingPackage;
    }
    updateValues.push(id);
    await pool.execute(
      `UPDATE packages SET ${updateFields.join(", ")}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );
    return this.findById(id);
  }
  static async delete(id) {
    const [userPackageRows] = await pool.execute(
      "SELECT COUNT(*) as count FROM user_packages WHERE packageId = ? AND isActive = TRUE",
      [id]
    );
    const userPackageCount = userPackageRows[0].count;
    if (userPackageCount > 0) {
      throw new Error("Cannot delete package that is currently being used by users");
    }
    const [result] = await pool.execute(
      "DELETE FROM packages WHERE id = ?",
      [id]
    );
    const deleteResult = result;
    return deleteResult.affectedRows > 0;
  }
};

// server/controllers/taskController.ts
init_schema();
import { validationResult as validationResult2, body as body2 } from "express-validator";

// server/services/notificationService.ts
init_database();
import { WebSocket } from "ws";
var NotificationService = class {
  static connectedUsers = /* @__PURE__ */ new Map();
  static addConnection(userId, role, socket) {
    this.connectedUsers.set(userId, { userId, role, socket });
    console.log(`User ${userId} (${role}) connected to notifications`);
    socket.on("close", () => {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected from notifications`);
    });
    socket.on("error", (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      this.connectedUsers.delete(userId);
    });
  }
  static async notifyUser(userId, notification) {
    const user = this.connectedUsers.get(userId);
    if (user && user.socket.readyState === WebSocket.OPEN) {
      try {
        user.socket.send(JSON.stringify({
          type: "notification",
          data: notification
        }));
        await this.storeNotification(userId, notification);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        this.connectedUsers.delete(userId);
      }
    }
  }
  static async notifyAllVendors(notification) {
    const vendors = Array.from(this.connectedUsers.values()).filter((user) => user.role === "vendor");
    for (const vendor of vendors) {
      if (vendor.socket.readyState === WebSocket.OPEN) {
        try {
          vendor.socket.send(JSON.stringify({
            type: "notification",
            data: notification
          }));
          await this.storeNotification(vendor.userId, notification);
        } catch (error) {
          console.error(`Failed to send notification to vendor ${vendor.userId}:`, error);
          this.connectedUsers.delete(vendor.userId);
        }
      }
    }
  }
  static async notifyTaskAssigned(taskId, vendorId, taskTitle) {
    const notification = {
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${taskTitle}`,
      data: { taskId },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyUser(vendorId, notification);
  }
  static async notifyTaskApproved(taskId, vendorId, taskTitle) {
    const notification = {
      type: "task_approved",
      title: "Task Approved",
      message: `Your task "${taskTitle}" has been approved!`,
      data: { taskId },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyUser(vendorId, notification);
  }
  static async notifyTaskRejected(taskId, vendorId, taskTitle, reason) {
    const notification = {
      type: "task_rejected",
      title: "Task Rejected",
      message: `Your task "${taskTitle}" has been rejected${reason ? `: ${reason}` : ""}`,
      data: { taskId, reason },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyUser(vendorId, notification);
  }
  static async notifyNewTaskAvailable(taskTitle) {
    const notification = {
      type: "task_available",
      title: "New Task Available",
      message: `New task available: ${taskTitle}`,
      data: {},
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyAllVendors(notification);
  }
  static async notifyTaskExpired(taskId, vendorId, taskTitle) {
    const notification = {
      type: "task_expired",
      title: "Task Expired",
      message: `Your task "${taskTitle}" has expired due to time limit`,
      data: { taskId },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyUser(vendorId, notification);
  }
  static async notifyReferralEarned(userId, amount, referredUser) {
    const notification = {
      type: "referral_earned",
      title: "Referral Commission Earned",
      message: `You earned \u20B9${amount} from ${referredUser}'s package purchase`,
      data: { amount, referredUser },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.notifyUser(userId, notification);
  }
  static async storeNotification(userId, notification) {
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
      console.error("Failed to store notification:", error);
    }
  }
  static async getUserNotifications(userId, limit = 20) {
    try {
      const query = `
        SELECT * FROM notifications 
        WHERE userId = ? 
        ORDER BY createdAt DESC 
        LIMIT ?
      `;
      const [rows] = await pool.execute(query, [userId, limit]);
      return rows.map((row) => ({
        ...row,
        data: JSON.parse(row.data || "{}")
      }));
    } catch (error) {
      console.error("Failed to get user notifications:", error);
      return [];
    }
  }
  static async markNotificationAsRead(notificationId, userId) {
    try {
      const query = `UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?`;
      await pool.execute(query, [notificationId, userId]);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
  static async markAllNotificationsAsRead(userId) {
    try {
      const query = `UPDATE notifications SET isRead = TRUE WHERE userId = ?`;
      await pool.execute(query, [userId]);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }
};

// server/controllers/taskController.ts
var TaskController = class {
  static validateCreateTask = [
    body2("title").notEmpty().withMessage("Title is required"),
    body2("description").notEmpty().withMessage("Description is required"),
    body2("timeLimit").isInt({ min: 1 }).withMessage("Time limit must be at least 1 hour"),
    body2("assignedTo").optional().isInt()
  ];
  static async createTask(req, res) {
    try {
      const errors = validationResult2(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const taskData = insertTaskSchema.parse(req.body);
      const task = await TaskModel.create(taskData);
      const response = {
        success: true,
        message: "Task created successfully",
        data: task
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create task"
      });
    }
  }
  static async getAllTasks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const tasks = await TaskModel.getAll(offset, limit);
      const response = {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks
      };
      res.json(response);
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tasks"
      });
    }
  }
  static async getVendorTasks(req, res) {
    try {
      const userId = req.user.id;
      const status = req.query.status;
      const tasks = await TaskModel.getByUserId(userId, status);
      const response = {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks
      };
      res.json(response);
    } catch (error) {
      console.error("Get vendor tasks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tasks"
      });
    }
  }
  static async getAvailableTasks(req, res) {
    try {
      const userId = req.user.id;
      const tasks = await TaskModel.getAvailableTasks(userId);
      const response = {
        success: true,
        message: "Available tasks retrieved successfully",
        data: tasks
      };
      res.json(response);
    } catch (error) {
      console.error("Get available tasks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve available tasks"
      });
    }
  }
  static async startTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.id;
      const canPerformTask = await PackageModel.canUserPerformAction(userId, "task");
      if (!canPerformTask) {
        return res.status(400).json({
          success: false,
          message: "Task limit exceeded or package expired. Please purchase a new package to continue.",
          requiresPackage: true
        });
      }
      const success = await TaskModel.startTask(taskId, userId);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Task not available or already assigned"
        });
      }
      await PackageModel.incrementTaskUsage(userId);
      await NotificationService.createNotification(
        userId,
        "task_started",
        `You have started working on task: ${taskId}`,
        `/tasks/${taskId}`
      );
      const response = {
        success: true,
        message: "Task started successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Start task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start task"
      });
    }
  }
  static async submitTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { submissionUrl, comments } = req.body;
      if (!submissionUrl) {
        return res.status(400).json({
          success: false,
          message: "Submission URL is required"
        });
      }
      const success = await TaskModel.submitTask(taskId, submissionUrl, comments);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Task not found or not in progress"
        });
      }
      const response = {
        success: true,
        message: "Task submitted successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Submit task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit task"
      });
    }
  }
  static async skipTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.id;
      const userPackage = await PackageModel.getUserPackageWithDetails(userId);
      if (!userPackage) {
        return res.status(400).json({
          success: false,
          message: "No active package found. Please purchase a package to continue.",
          requiresPackage: true
        });
      }
      let canSkip = false;
      let useTaskLimit = false;
      if (userPackage.skipsUsed < userPackage.packageDetails.skipLimit) {
        canSkip = true;
      } else if (userPackage.tasksUsed < userPackage.packageDetails.taskLimit) {
        canSkip = true;
        useTaskLimit = true;
      }
      if (!canSkip) {
        return res.status(400).json({
          success: false,
          message: "Skip limit and task limit both exceeded. Please purchase a new package.",
          requiresPackage: true
        });
      }
      const success = await TaskModel.updateStatus(taskId, "available" /* AVAILABLE */);
      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Task not found"
        });
      }
      if (useTaskLimit) {
        await PackageModel.incrementTaskUsage(userId);
      } else {
        await PackageModel.incrementSkipUsage(userId);
      }
      await NotificationService.createNotification(
        userId,
        "task_skipped",
        `You have skipped task: ${taskId}${useTaskLimit ? " (deducted from task limit)" : ""}`,
        `/tasks`
      );
      const response = {
        success: true,
        message: `Task skipped successfully${useTaskLimit ? " (deducted from task limit)" : ""}`
      };
      res.json(response);
    } catch (error) {
      console.error("Skip task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to skip task"
      });
    }
  }
  static async updateTaskStatus(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      if (!Object.values(TaskStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status"
        });
      }
      const success = await TaskModel.updateStatus(taskId, status);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }
      const response = {
        success: true,
        message: "Task status updated successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Update task status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task status"
      });
    }
  }
  static async deleteTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const success = await TaskModel.delete(taskId);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }
      const response = {
        success: true,
        message: "Task deleted successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete task"
      });
    }
  }
  static async updateTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      const success = await TaskModel.update(taskId, updates);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }
      const response = {
        success: true,
        message: "Task updated successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task"
      });
    }
  }
  // Bulk Operations for Admins
  static validateBulkOperation = [
    body2("taskIds").isArray({ min: 1 }).withMessage("Task IDs array is required"),
    body2("taskIds.*").isInt().withMessage("Each task ID must be a number"),
    body2("action").isIn(["approve", "reject", "delete", "assign", "status"]).withMessage("Invalid bulk action")
  ];
  static async bulkOperation(req, res) {
    try {
      const errors = validationResult2(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const { taskIds, action, vendorId, status, rejectionReason } = req.body;
      let successCount = 0;
      let failedTasks = [];
      for (const taskId of taskIds) {
        try {
          switch (action) {
            case "approve":
              const approveSuccess = await TaskModel.updateStatus(taskId, "completed" /* COMPLETED */);
              if (approveSuccess) {
                const task = await TaskModel.findById(taskId);
                if (task && task.assignedTo) {
                  await NotificationService.notifyTaskApproved(taskId, task.assignedTo, task.title);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;
            case "reject":
              const rejectSuccess = await TaskModel.updateStatus(taskId, "rejected" /* REJECTED */);
              if (rejectSuccess) {
                const task = await TaskModel.findById(taskId);
                if (task && task.assignedTo) {
                  await NotificationService.notifyTaskRejected(taskId, task.assignedTo, task.title, rejectionReason);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;
            case "delete":
              const deleteSuccess = await TaskModel.delete(taskId);
              if (deleteSuccess) {
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;
            case "assign":
              if (!vendorId) {
                failedTasks.push(taskId);
                continue;
              }
              const assignSuccess = await TaskModel.assignToVendor(taskId, vendorId);
              if (assignSuccess) {
                const task = await TaskModel.findById(taskId);
                if (task) {
                  await NotificationService.notifyTaskAssigned(taskId, vendorId, task.title);
                }
                successCount++;
              } else {
                failedTasks.push(taskId);
              }
              break;
            case "status":
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
      const response = {
        success: true,
        message: `Bulk operation completed. ${successCount} tasks processed successfully${failedTasks.length > 0 ? `, ${failedTasks.length} failed` : ""}`,
        data: {
          successCount,
          failedTasks,
          totalProcessed: taskIds.length
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Bulk operation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform bulk operation"
      });
    }
  }
  static async getTasksWithFilters(req, res) {
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
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const tasks = await TaskModel.getWithFilters({
        status,
        assignedTo: assignedTo ? parseInt(assignedTo) : void 0,
        dateFrom,
        dateTo,
        search,
        offset,
        limit: parseInt(limit)
      });
      const response = {
        success: true,
        message: "Tasks retrieved successfully",
        data: tasks
      };
      res.json(response);
    } catch (error) {
      console.error("Get filtered tasks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tasks"
      });
    }
  }
};

// server/controllers/userController.ts
init_User();

// server/models/Referral.ts
init_database();
var COMMISSION_RATES = {
  1: 0.1,
  // 10%
  2: 0.05,
  // 5%
  3: 0.04,
  // 4%
  4: 0.03,
  // 3%
  5: 0.02
  // 2%
};
var ReferralModel = class {
  static async createReferralChain(referrerId, referredId, packagePrice) {
    const referrals = await this.buildReferralChain(referrerId, 1);
    for (const referral of referrals) {
      if (referral.level <= 5) {
        const commission = packagePrice * COMMISSION_RATES[referral.level];
        await pool.execute(
          `INSERT INTO referrals (referrerId, referredId, level, commission) VALUES (?, ?, ?, ?)`,
          [referral.referrerId, referredId, referral.level, commission]
        );
      }
    }
  }
  static async buildReferralChain(userId, level) {
    if (level > 5) return [];
    const [rows] = await pool.execute(
      "SELECT referrerId FROM users WHERE id = ? AND referrerId IS NOT NULL",
      [userId]
    );
    const users = rows;
    if (users.length === 0) return [];
    const referrerId = users[0].referrerId;
    const chain = [{ referrerId, level }];
    const upperChain = await this.buildReferralChain(referrerId, level + 1);
    return chain.concat(upperChain);
  }
  static async getReferralStats(userId) {
    const [totalRows] = await pool.execute(
      "SELECT COUNT(*) as count, COALESCE(SUM(commission), 0) as total FROM referrals WHERE referrerId = ?",
      [userId]
    );
    const totalResult = totalRows;
    const totalReferrals = totalResult[0].count;
    const totalEarnings = totalResult[0].total;
    const [monthlyRows] = await pool.execute(
      `SELECT COALESCE(SUM(commission), 0) as total FROM referrals 
       WHERE referrerId = ? AND MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW())`,
      [userId]
    );
    const monthlyResult = monthlyRows;
    const monthlyEarnings = monthlyResult[0].total;
    const [levelRows] = await pool.execute(
      "SELECT level, COUNT(*) as count FROM referrals WHERE referrerId = ? GROUP BY level",
      [userId]
    );
    const levelResult = levelRows;
    const referralsByLevel = {};
    levelResult.forEach((row) => {
      referralsByLevel[row.level] = row.count;
    });
    return {
      totalReferrals,
      totalEarnings,
      monthlyEarnings,
      referralsByLevel
    };
  }
  static async getUserReferrals(userId) {
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as referredName 
       FROM referrals r 
       JOIN users u ON r.referredId = u.id 
       WHERE r.referrerId = ? 
       ORDER BY r.createdAt DESC`,
      [userId]
    );
    return rows;
  }
  static async getTopReferrers(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT u.id as userId, u.name, COUNT(r.id) as totalReferrals, COALESCE(SUM(r.commission), 0) as totalEarnings
       FROM users u
       LEFT JOIN referrals r ON u.id = r.referrerId
       WHERE u.role = 'vendor'
       GROUP BY u.id, u.name
       HAVING totalReferrals > 0
       ORDER BY totalEarnings DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

// server/controllers/userController.ts
init_schema();
var UserController = class {
  static async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const users = await UserModel.getAll(offset, limit);
      const safeUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        referrerId: user.referrerId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      const response = {
        success: true,
        message: "Users retrieved successfully",
        data: safeUsers
      };
      res.json(response);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve users"
      });
    }
  }
  static async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const userPackage = await PackageModel.getUserPackage(userId);
      const referralStats = await ReferralModel.getReferralStats(userId);
      const response = {
        success: true,
        message: "User retrieved successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          referrerId: user.referrerId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          package: userPackage,
          referralStats
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user"
      });
    }
  }
  static async blockUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot block yourself"
        });
      }
      const success = await UserModel.updateStatus(userId, "blocked" /* BLOCKED */);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const response = {
        success: true,
        message: "User blocked successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to block user"
      });
    }
  }
  static async unblockUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const success = await UserModel.updateStatus(userId, "active" /* ACTIVE */);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      const response = {
        success: true,
        message: "User unblocked successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unblock user"
      });
    }
  }
  static async getVendors(req, res) {
    try {
      const vendors = await UserModel.getVendors();
      const safeVendors = vendors.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        referralCode: user.referralCode,
        createdAt: user.createdAt
      }));
      const response = {
        success: true,
        message: "Vendors retrieved successfully",
        data: safeVendors
      };
      res.json(response);
    } catch (error) {
      console.error("Get vendors error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve vendors"
      });
    }
  }
  static async getDashboardStats(req, res) {
    try {
      const response = {
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: {
          totalUsers: 0,
          activeUsers: 0,
          blockedUsers: 0,
          totalTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          totalRevenue: 0
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve dashboard stats"
      });
    }
  }
};

// server/controllers/packageController.ts
import { validationResult as validationResult3, body as body3 } from "express-validator";
var PackageController = class {
  static async getUserPackage(req, res) {
    try {
      const userId = req.user.id;
      const userPackage = await PackageModel.getUserPackageWithDetails(userId);
      if (!userPackage) {
        return res.status(404).json({
          success: false,
          message: "No active package found"
        });
      }
      const response = {
        success: true,
        message: "User package retrieved successfully",
        data: userPackage
      };
      res.json(response);
    } catch (error) {
      console.error("Get user package error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user package"
      });
    }
  }
  static async getAllPackages(req, res) {
    try {
      const packages = await PackageModel.getAll();
      const response = {
        success: true,
        message: "Packages retrieved successfully",
        data: packages
      };
      res.json(response);
    } catch (error) {
      console.error("Get packages error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve packages"
      });
    }
  }
  static async getPackageById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const packageData = await PackageModel.findById(id);
      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }
      const response = {
        success: true,
        message: "Package retrieved successfully",
        data: packageData
      };
      res.json(response);
    } catch (error) {
      console.error("Get package by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve package"
      });
    }
  }
  static async checkUserLimits(req, res) {
    try {
      const userId = req.user.id;
      const userPackage = await PackageModel.getUserPackageWithDetails(userId);
      if (!userPackage) {
        return res.status(404).json({
          success: false,
          message: "No active package found"
        });
      }
      const response = {
        success: true,
        message: "User limits retrieved successfully",
        data: {
          tasksRemaining: userPackage.tasksRemaining,
          skipsRemaining: userPackage.skipsRemaining,
          daysLeft: userPackage.daysLeft,
          canPerformTask: userPackage.tasksRemaining > 0,
          canSkip: userPackage.skipsRemaining > 0 || userPackage.tasksRemaining > 0
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Check user limits error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check user limits"
      });
    }
  }
  static validateCreatePackage = [
    body3("name").notEmpty().withMessage("Package name is required"),
    body3("type").isIn(["Onsite", "Online"]).withMessage("Package type must be Onsite or Online"),
    body3("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body3("taskLimit").isInt({ min: 1 }).withMessage("Task limit must be at least 1"),
    body3("skipLimit").isInt({ min: 0 }).withMessage("Skip limit must be non-negative"),
    body3("description").optional().isString()
  ];
  static async createPackage(req, res) {
    try {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const packageData = req.body;
      const newPackage = await PackageModel.create(packageData);
      const response = {
        success: true,
        message: "Package created successfully",
        data: newPackage
      };
      res.status(201).json(response);
    } catch (error) {
      console.error("Create package error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create package"
      });
    }
  }
  static validateUpdatePackage = [
    body3("name").optional().notEmpty().withMessage("Package name cannot be empty"),
    body3("type").optional().isIn(["Onsite", "Online"]).withMessage("Package type must be Onsite or Online"),
    body3("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body3("taskLimit").optional().isInt({ min: 1 }).withMessage("Task limit must be at least 1"),
    body3("skipLimit").optional().isInt({ min: 0 }).withMessage("Skip limit must be non-negative"),
    body3("description").optional().isString()
  ];
  static async updatePackage(req, res) {
    try {
      const errors = validationResult3(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const packageId = parseInt(req.params.id);
      const packageData = req.body;
      const updatedPackage = await PackageModel.update(packageId, packageData);
      if (!updatedPackage) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }
      const response = {
        success: true,
        message: "Package updated successfully",
        data: updatedPackage
      };
      res.json(response);
    } catch (error) {
      console.error("Update package error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update package"
      });
    }
  }
  static async deletePackage(req, res) {
    try {
      const packageId = parseInt(req.params.id);
      const success = await PackageModel.delete(packageId);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }
      const response = {
        success: true,
        message: "Package deleted successfully"
      };
      res.json(response);
    } catch (error) {
      console.error("Delete package error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete package"
      });
    }
  }
};

// server/controllers/referralController.ts
var ReferralController = class {
  static async getReferralStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await ReferralModel.getReferralStats(userId);
      const response = {
        success: true,
        message: "Referral stats retrieved successfully",
        data: stats
      };
      res.json(response);
    } catch (error) {
      console.error("Get referral stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve referral stats"
      });
    }
  }
  static async getUserReferrals(req, res) {
    try {
      const userId = req.user.id;
      const referrals = await ReferralModel.getUserReferrals(userId);
      const response = {
        success: true,
        message: "User referrals retrieved successfully",
        data: referrals
      };
      res.json(response);
    } catch (error) {
      console.error("Get user referrals error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user referrals"
      });
    }
  }
  static async getTopReferrers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topReferrers = await ReferralModel.getTopReferrers(limit);
      const response = {
        success: true,
        message: "Top referrers retrieved successfully",
        data: topReferrers
      };
      res.json(response);
    } catch (error) {
      console.error("Get top referrers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve top referrers"
      });
    }
  }
  static async getReferralSystemStats(req, res) {
    try {
      const response = {
        success: true,
        message: "Referral system stats retrieved successfully",
        data: {
          totalReferrals: 0,
          activeReferrers: 0,
          totalPayouts: 0,
          referralsByLevel: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Get referral system stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve referral system stats"
      });
    }
  }
};

// server/controllers/paymentController.ts
import Razorpay from "razorpay";
import crypto from "crypto";

// server/models/Payment.ts
init_database();
var PaymentModel = class {
  static async create(paymentData) {
    const [result] = await pool.execute(
      `INSERT INTO payments (userId, packageId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        paymentData.userId,
        paymentData.packageId,
        paymentData.amount,
        paymentData.razorpayOrderId,
        paymentData.razorpayPaymentId || null,
        paymentData.razorpaySignature || null
      ]
    );
    const insertResult = result;
    const [newPaymentRows] = await pool.execute(
      "SELECT * FROM payments WHERE id = ?",
      [insertResult.insertId]
    );
    const payments = newPaymentRows;
    return payments[0];
  }
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );
    const payments = rows;
    return payments[0] || null;
  }
  static async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      "SELECT * FROM payments WHERE razorpayOrderId = ?",
      [orderId]
    );
    const payments = rows;
    return payments[0] || null;
  }
  static async updateStatus(paymentId, status, paymentDetails) {
    let query = "UPDATE payments SET status = ?, updatedAt = CURRENT_TIMESTAMP";
    const params = [status];
    if (paymentDetails?.razorpayPaymentId) {
      query += ", razorpayPaymentId = ?";
      params.push(paymentDetails.razorpayPaymentId);
    }
    if (paymentDetails?.razorpaySignature) {
      query += ", razorpaySignature = ?";
      params.push(paymentDetails.razorpaySignature);
    }
    query += " WHERE id = ?";
    params.push(paymentId);
    const [result] = await pool.execute(query, params);
    const updateResult = result;
    return updateResult.affectedRows > 0;
  }
  static async getUserPayments(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC",
      [userId]
    );
    return rows;
  }
  static async getAllPayments(offset = 0, limit = 50) {
    const [rows] = await pool.execute(
      "SELECT * FROM payments ORDER BY createdAt DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows;
  }
};

// server/controllers/paymentController.ts
init_schema();
var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_OhqJDvzONAAemV",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Vjxjdug9chXaUYOsJmcMuOxs"
});
var PaymentController = class {
  static async createOrder(req, res) {
    try {
      const { packageId } = req.body;
      const userId = req.user.id;
      const packageInfo = await PackageModel.findById(packageId);
      if (!packageInfo) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }
      const options = {
        amount: Math.round(packageInfo.price * 100),
        // Convert to paise
        currency: "INR",
        receipt: `order_${userId}_${packageId}_${Date.now()}`,
        notes: {
          userId: userId.toString(),
          packageId: packageId.toString()
        }
      };
      const order = await razorpay.orders.create(options);
      await PaymentModel.create({
        userId,
        packageId,
        amount: packageInfo.price,
        razorpayOrderId: order.id,
        razorpayPaymentId: void 0,
        razorpaySignature: void 0
      });
      const response = {
        success: true,
        message: "Order created successfully",
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID || "rzp_live_OhqJDvzONAAemV"
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment order"
      });
    }
  }
  static async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const userId = req.user.id;
      const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "Vjxjdug9chXaUYOsJmcMuOxs");
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");
      if (digest !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment signature"
        });
      }
      const payment = await PaymentModel.findByOrderId(razorpay_order_id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found"
        });
      }
      await PaymentModel.updateStatus(payment.id, "completed" /* COMPLETED */, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });
      const userPackage = await PackageModel.createUserPackage(userId, payment.packageId);
      const packageInfo = await PackageModel.findById(payment.packageId);
      if (packageInfo) {
        const user = await (init_User(), __toCommonJS(User_exports)).UserModel.findById(userId);
        if (user && user.referrerId) {
          await ReferralModel.createReferralChain(user.referrerId, user.id, packageInfo.price);
        }
      }
      const response = {
        success: true,
        message: "Payment verified and package activated successfully",
        data: {
          payment,
          userPackage
        }
      };
      res.json(response);
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  }
  static async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const payments = await PaymentModel.getUserPayments(userId);
      const response = {
        success: true,
        message: "User payments retrieved successfully",
        data: payments
      };
      res.json(response);
    } catch (error) {
      console.error("Get user payments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user payments"
      });
    }
  }
  static async getAllPayments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      const payments = await PaymentModel.getAllPayments(offset, limit);
      const response = {
        success: true,
        message: "Payments retrieved successfully",
        data: payments
      };
      res.json(response);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve payments"
      });
    }
  }
};

// server/models/UserProfile.ts
init_database();
var UserProfileModel = class {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        phone VARCHAR(20),
        bio TEXT,
        location VARCHAR(255),
        contentCreatorType VARCHAR(50),
        socialLinks JSON,
        profilePhoto VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    await pool.execute(query);
  }
  static async findByUserId(userId) {
    const query = `
      SELECT up.*, u.name, u.email 
      FROM user_profiles up
      JOIN users u ON up.userId = u.id
      WHERE up.userId = ?
    `;
    const [rows] = await pool.execute(query, [userId]);
    if (rows.length === 0) {
      return null;
    }
    const profile = rows[0];
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null
    };
  }
  static async create(data) {
    const query = `
      INSERT INTO user_profiles (userId, phone, bio, location, contentCreatorType, socialLinks, profilePhoto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const socialLinksJson = data.socialLinks ? JSON.stringify(data.socialLinks) : null;
    const [result] = await pool.execute(query, [
      data.userId,
      data.phone || null,
      data.bio || null,
      data.location || null,
      data.contentCreatorType || null,
      socialLinksJson,
      data.profilePhoto || null
    ]);
    const profile = await this.findById(result.insertId);
    if (!profile) {
      throw new Error("Failed to create user profile");
    }
    return profile;
  }
  static async update(userId, data) {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = await this.create({ userId, ...data });
      return profile;
    }
    const query = `
      UPDATE user_profiles 
      SET phone = ?, bio = ?, location = ?, contentCreatorType = ?, socialLinks = ?, profilePhoto = ?
      WHERE userId = ?
    `;
    const socialLinksJson = data.socialLinks ? JSON.stringify(data.socialLinks) : null;
    await pool.execute(query, [
      data.phone || null,
      data.bio || null,
      data.location || null,
      data.contentCreatorType || null,
      socialLinksJson,
      data.profilePhoto || null,
      userId
    ]);
    const updatedProfile = await this.findByUserId(userId);
    if (!updatedProfile) {
      throw new Error("Failed to update user profile");
    }
    return updatedProfile;
  }
  static async findById(id) {
    const query = `
      SELECT up.*, u.name, u.email 
      FROM user_profiles up
      JOIN users u ON up.userId = u.id
      WHERE up.id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) {
      return null;
    }
    const profile = rows[0];
    return {
      ...profile,
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null
    };
  }
  static async updateProfilePhoto(userId, profilePhoto) {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      await this.create({ userId, profilePhoto });
      return;
    }
    const query = `UPDATE user_profiles SET profilePhoto = ? WHERE userId = ?`;
    await pool.execute(query, [profilePhoto, userId]);
  }
};

// server/controllers/userProfileController.ts
import { body as body4, validationResult as validationResult4 } from "express-validator";
var UserProfileController = class {
  static validateUpdateProfile = [
    body4("name").optional().isLength({ min: 2, max: 100 }).trim().withMessage("Name must be between 2-100 characters"),
    body4("phone").optional().custom((value) => {
      if (!value) return true;
      const phoneRegex = /^(\+91[-\s]?)?[0]?(91[-\s]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ""))) {
        throw new Error("Invalid phone number format");
      }
      return true;
    }),
    body4("bio").optional().isLength({ max: 500 }).trim().withMessage("Bio must be less than 500 characters"),
    body4("location").optional().isLength({ max: 255 }).trim().withMessage("Location must be less than 255 characters"),
    body4("contentCreatorType").optional().isIn([
      "influencer",
      "blogger",
      "youtuber",
      "photographer",
      "videographer",
      "artist",
      "musician",
      "podcaster",
      "streamer",
      "educator",
      "reviewer",
      "other"
    ]).withMessage("Invalid content creator type"),
    body4("socialLinks").optional().isObject().withMessage("Social links must be an object"),
    body4("profilePhoto").optional().isString().withMessage("Profile photo must be a string URL")
  ];
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      let profile = await UserProfileModel.findByUserId(userId);
      if (!profile) {
        return res.json({
          success: true,
          message: "Profile retrieved successfully",
          data: {
            name: req.user.email.split("@")[0],
            // Default name from email
            email: req.user.email,
            phone: "",
            bio: "",
            location: "",
            contentCreatorType: "",
            socialLinks: {
              instagram: "",
              youtube: "",
              twitter: "",
              facebook: "",
              tiktok: "",
              website: ""
            },
            profilePhoto: null
          }
        });
      }
      res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile
      });
    } catch (error) {
      console.error("Error getting profile:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
  static async updateProfile(req, res) {
    try {
      const errors = validationResult4(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array()
        });
      }
      const userId = req.user.id;
      const { name, phone, bio, location, contentCreatorType, socialLinks, profilePhoto } = req.body;
      if (name) {
        const { pool: pool2 } = await Promise.resolve().then(() => (init_database(), database_exports));
        await pool2.execute("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
      }
      const profile = await UserProfileModel.update(userId, {
        phone,
        bio,
        location,
        contentCreatorType,
        socialLinks,
        profilePhoto
      });
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: profile
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
  static async uploadProfilePhoto(req, res) {
    try {
      const userId = req.user.id;
      const profilePhoto = req.body.profilePhoto;
      if (!profilePhoto) {
        return res.status(400).json({
          success: false,
          message: "Profile photo URL is required"
        });
      }
      await UserProfileModel.updateProfilePhoto(userId, profilePhoto);
      res.json({
        success: true,
        message: "Profile photo updated successfully",
        data: { profilePhoto }
      });
    } catch (error) {
      console.error("Error updating profile photo:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
};

// server/models/SimpleWallet.ts
init_database();
var SimpleWallet = class {
  // Get user's current wallet balance from users table
  static async getBalance(userId) {
    const [rows] = await pool.execute(
      "SELECT wallet_balance FROM users WHERE id = ?",
      [userId]
    );
    const result = rows;
    return result[0]?.wallet_balance || 0;
  }
  // Update user's wallet balance
  static async updateBalance(userId, newBalance) {
    await pool.execute(
      "UPDATE users SET wallet_balance = ? WHERE id = ?",
      [newBalance, userId]
    );
  }
  // Add money to wallet (credit)
  static async addFunds(userId, amount, description, taskId) {
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;
    await this.updateBalance(userId, newBalance);
    await this.logTransaction(userId, "credit", amount, description, taskId);
  }
  // Deduct money from wallet (debit)
  static async deductFunds(userId, amount, description) {
    const currentBalance = await this.getBalance(userId);
    if (currentBalance < amount) {
      return false;
    }
    const newBalance = currentBalance - amount;
    await this.updateBalance(userId, newBalance);
    await this.logTransaction(userId, "debit", amount, description);
    return true;
  }
  // Create a simple transaction log in wallet_transactions table
  static async logTransaction(userId, type, amount, description, taskId) {
    try {
      await pool.execute(
        `INSERT INTO wallet_transactions (wallet_id, type, amount, description, related_task_id, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, type, amount, description, taskId || null]
      );
    } catch (error) {
      console.log(`Wallet transaction: User ${userId}, ${type} \u20B9${amount} - ${description}`);
    }
  }
  // Get transaction history (if table exists)
  static async getTransactionHistory(userId, limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          id,
          wallet_id as userId,
          type,
          amount,
          description,
          related_task_id as taskId,
          'completed' as status,
          created_at as createdAt
         FROM wallet_transactions 
         WHERE wallet_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      return [];
    }
  }
  // Request withdrawal
  static async requestWithdrawal(userId, amount) {
    const success = await this.deductFunds(userId, amount, `Withdrawal request - \u20B9${amount}`);
    if (success) {
      console.log(`Withdrawal request: User ${userId} requested \u20B9${amount}`);
    }
    return success;
  }
};

// server/controllers/walletController.ts
import { body as body5 } from "express-validator";
var WalletController = class {
  static async getWalletBalance(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const balance = await SimpleWallet.getBalance(userId);
      res.json({
        success: true,
        message: "Wallet balance retrieved successfully",
        data: { balance }
      });
    } catch (error) {
      console.error("Get wallet balance error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve wallet balance"
      });
    }
  }
  static async getWalletTransactions(req, res) {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const transactions = await SimpleWallet.getTransactionHistory(userId, limit);
      const balance = await SimpleWallet.getBalance(userId);
      res.json({
        success: true,
        message: "Wallet transactions retrieved successfully",
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
      console.error("Get wallet transactions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve wallet transactions"
      });
    }
  }
  static async requestWithdrawal(req, res) {
    try {
      const userId = req.user?.id;
      const { amount } = req.body;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid amount is required"
        });
      }
      const currentBalance = await SimpleWallet.getBalance(userId);
      if (currentBalance < amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance"
        });
      }
      const success = await SimpleWallet.requestWithdrawal(userId, amount);
      if (success) {
        res.json({
          success: true,
          message: "Withdrawal request submitted successfully",
          data: {
            amount,
            remainingBalance: await SimpleWallet.getBalance(userId)
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Withdrawal request failed"
        });
      }
    } catch (error) {
      console.error("Withdrawal request error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process withdrawal request"
      });
    }
  }
  static validateWithdrawalRequest() {
    return [
      body5("amount").isNumeric().withMessage("Amount must be a number").custom((value) => {
        if (value <= 0) {
          throw new Error("Amount must be greater than 0");
        }
        if (value < 100) {
          throw new Error("Minimum withdrawal amount is \u20B9100");
        }
        return true;
      })
    ];
  }
};

// server/controllers/profileController.ts
init_User();
init_schema();
import { body as body6, validationResult as validationResult6 } from "express-validator";
var ProfileController = class {
  static validateUpdateProfile = [
    body6("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body6("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
    body6("phone").optional().trim().isLength({ min: 10 }).withMessage("Phone must be at least 10 digits"),
    body6("bankAccountName").optional().trim(),
    body6("bankAccountNumber").optional().trim(),
    body6("bankIfscCode").optional().trim(),
    body6("bankName").optional().trim(),
    body6("upiId").optional().trim()
  ];
  static async updateProfile(req, res) {
    try {
      const errors = validationResult6(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array()
        });
      }
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const updateData = updateProfileSchema.parse(req.body);
      const fields = Object.keys(updateData).filter((key) => updateData[key] !== void 0);
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields to update"
        });
      }
      const setClause = fields.map((field) => {
        const dbField = field.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbField} = ?`;
      }).join(", ");
      const values = fields.map((field) => updateData[field]);
      values.push(userId);
      await UserModel.updateProfile(userId, updateData);
      const updatedUser = await UserModel.findById(userId);
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            referralCode: updatedUser.referralCode,
            profilePhoto: updatedUser.profilePhoto,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            walletBalance: updatedUser.walletBalance,
            bankAccountName: updatedUser.bankAccountName,
            bankAccountNumber: updatedUser.bankAccountNumber,
            bankIfscCode: updatedUser.bankIfscCode,
            bankName: updatedUser.bankName,
            upiId: updatedUser.upiId,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
          }
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile"
      });
    }
  }
  static async uploadProfilePhoto(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      const photoUrl = `/uploads/${req.file.filename}`;
      await UserModel.updateProfile(userId, { profilePhoto: photoUrl });
      res.json({
        success: true,
        message: "Profile photo updated successfully",
        data: { profilePhoto: photoUrl }
      });
    } catch (error) {
      console.error("Upload profile photo error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload profile photo"
      });
    }
  }
};

// server/routes.ts
import jwt3 from "jsonwebtoken";

// server/middleware/auth.ts
init_User();
init_schema();
import jwt2 from "jsonwebtoken";
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }
  try {
    const decoded = jwt2.verify(token, process.env.JWT_SECRET || "NitishTrytohard@22000");
    const user = await UserModel.findById(decoded.id);
    if (!user || user.status === "blocked") {
      return res.status(401).json({ success: false, message: "Invalid or blocked user" });
    }
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin" /* ADMIN */) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};
var requireVendor = (req, res, next) => {
  if (req.user?.role !== "vendor" /* VENDOR */) {
    return res.status(403).json({ success: false, message: "Vendor access required" });
  }
  next();
};

// server/middleware/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadDir = process.env.UPLOAD_PATH || "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  return cb(null, true);
};
var upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "1000000000")
    // 1GB default
  }
});

// server/routes.ts
async function registerRoutes(app2) {
  await initializeDatabase();
  CronService.init();
  app2.use(cors({
    origin: process.env.NODE_ENV === "production" ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://your-domain.com"] : ["http://localhost:5000", "http://localhost:3000"],
    credentials: true
  }));
  app2.get("/api/health", (req, res) => {
    res.json({ success: true, message: "Server is running" });
  });
  app2.post("/api/auth/register", AuthController.validateRegister, AuthController.register);
  app2.post("/api/auth/login", AuthController.validateLogin, AuthController.login);
  app2.get("/api/auth/profile", authenticateToken, AuthController.getProfile);
  app2.get("/api/auth/google", AuthController.googleAuth);
  app2.get("/api/auth/google/callback", AuthController.googleCallback);
  app2.post("/api/auth/forgot-password", AuthController.validateForgotPassword, AuthController.forgotPassword);
  app2.post("/api/auth/reset-password", AuthController.validateResetPassword, AuthController.resetPassword);
  app2.get("/api/auth/validate-reset-token", AuthController.validateResetToken);
  app2.get("/api/tasks", authenticateToken, TaskController.getAllTasks);
  app2.get("/api/tasks/filtered", authenticateToken, requireAdmin, TaskController.getTasksWithFilters);
  app2.post("/api/tasks", authenticateToken, requireAdmin, TaskController.validateCreateTask, TaskController.createTask);
  app2.post("/api/tasks/bulk", authenticateToken, requireAdmin, TaskController.validateBulkOperation, TaskController.bulkOperation);
  app2.get("/api/tasks/available", authenticateToken, requireVendor, TaskController.getAvailableTasks);
  app2.get("/api/tasks/vendor", authenticateToken, requireVendor, TaskController.getVendorTasks);
  app2.post("/api/tasks/:id/start", authenticateToken, requireVendor, TaskController.startTask);
  app2.post("/api/tasks/:id/submit", authenticateToken, requireVendor, TaskController.submitTask);
  app2.post("/api/tasks/:id/skip", authenticateToken, requireVendor, TaskController.skipTask);
  app2.patch("/api/tasks/:id/status", authenticateToken, requireAdmin, TaskController.updateTaskStatus);
  app2.put("/api/tasks/:id", authenticateToken, requireAdmin, TaskController.updateTask);
  app2.delete("/api/tasks/:id", authenticateToken, requireAdmin, TaskController.deleteTask);
  app2.get("/api/users", authenticateToken, requireAdmin, UserController.getAllUsers);
  app2.get("/api/users/vendors", authenticateToken, requireAdmin, UserController.getVendors);
  app2.get("/api/users/:id", authenticateToken, requireAdmin, UserController.getUserById);
  app2.post("/api/users/:id/block", authenticateToken, requireAdmin, UserController.blockUser);
  app2.post("/api/users/:id/unblock", authenticateToken, requireAdmin, UserController.unblockUser);
  app2.get("/api/admin/stats", authenticateToken, requireAdmin, UserController.getDashboardStats);
  app2.get("/api/packages", authenticateToken, PackageController.getAllPackages);
  app2.get("/api/packages/:id", authenticateToken, PackageController.getPackageById);
  app2.get("/api/user/package", authenticateToken, PackageController.getUserPackage);
  app2.get("/api/user/limits", authenticateToken, PackageController.checkUserLimits);
  app2.post("/api/admin/packages", authenticateToken, requireAdmin, PackageController.createPackage);
  app2.put("/api/admin/packages/:id", authenticateToken, requireAdmin, PackageController.updatePackage);
  app2.delete("/api/admin/packages/:id", authenticateToken, requireAdmin, PackageController.deletePackage);
  app2.get("/api/referrals/stats", authenticateToken, ReferralController.getReferralStats);
  app2.get("/api/referrals/mine", authenticateToken, ReferralController.getUserReferrals);
  app2.get("/api/referrals/top", authenticateToken, requireAdmin, ReferralController.getTopReferrers);
  app2.get("/api/admin/referrals/stats", authenticateToken, requireAdmin, ReferralController.getReferralSystemStats);
  app2.get("/api/user/profile", authenticateToken, UserProfileController.getProfile);
  app2.put("/api/user/profile", authenticateToken, ProfileController.validateUpdateProfile, ProfileController.updateProfile);
  app2.post("/api/user/profile/photo", authenticateToken, upload.single("photo"), ProfileController.uploadProfilePhoto);
  app2.get("/api/wallet/balance", authenticateToken, WalletController.getWalletBalance);
  app2.get("/api/wallet/transactions", authenticateToken, WalletController.getWalletTransactions);
  app2.post("/api/wallet/withdraw", authenticateToken, WalletController.validateWithdrawalRequest(), WalletController.requestWithdrawal);
  app2.post("/api/payments/create-order", authenticateToken, PaymentController.createOrder);
  app2.post("/api/payments/verify", authenticateToken, PaymentController.verifyPayment);
  app2.get("/api/payments/mine", authenticateToken, PaymentController.getUserPayments);
  app2.get("/api/payments", authenticateToken, requireAdmin, PaymentController.getAllPayments);
  app2.post("/api/admin/packages", authenticateToken, requireAdmin, PackageController.validateCreatePackage, PackageController.createPackage);
  app2.put("/api/admin/packages/:id", authenticateToken, requireAdmin, PackageController.validateUpdatePackage, PackageController.updatePackage);
  app2.delete("/api/admin/packages/:id", authenticateToken, requireAdmin, PackageController.deletePackage);
  app2.post("/api/upload", authenticateToken, upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Upload failed"
      });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const notifications = await NotificationService.getUserNotifications(userId, limit);
      res.json({
        success: true,
        message: "Notifications retrieved successfully",
        data: notifications
      });
    } catch (error) {
      console.error("Error getting notifications:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.put("/api/notifications/:id/read", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = parseInt(req.params.id);
      await NotificationService.markNotificationAsRead(notificationId, userId);
      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.put("/api/notifications/read-all", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      await NotificationService.markAllNotificationsAsRead(userId);
      res.json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  app2.use("/uploads", express.static(process.env.UPLOAD_PATH || "./uploads/"));
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws, req) => {
    console.log("WebSocket connection attempt");
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token") || req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      ws.close(1008, "Authentication required");
      return;
    }
    try {
      const decoded = jwt3.verify(token, process.env.JWT_SECRET || "NitishTrytohard@22000");
      NotificationService.addConnection(decoded.id, decoded.role, ws);
      ws.send(JSON.stringify({
        type: "connected",
        message: "Connected to notifications"
      }));
    } catch (error) {
      console.error("WebSocket authentication failed:", error);
      ws.close(1008, "Invalid token");
    }
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid3 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid3()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
