import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'swift.herosite.pro',
  user: process.env.DB_USER || 'starsflock',
  password: process.env.DB_PASSWORD || 'Nitish@123',
  database: process.env.DB_NAME || 'instarsflock',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

export const pool = mysql.createPool(dbConfig);

export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Drop tables in correct order (child tables first)
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    await connection.execute(`DROP TABLE IF EXISTS payments`);
    await connection.execute(`DROP TABLE IF EXISTS user_packages`);
    await connection.execute(`DROP TABLE IF EXISTS referrals`);
    await connection.execute(`DROP TABLE IF EXISTS tasks`);
    await connection.execute(`DROP TABLE IF EXISTS packages`);
    await connection.execute(`DROP TABLE IF EXISTS users`);
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);

    // Users table
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'vendor') DEFAULT 'vendor',
        status ENUM('active', 'blocked') DEFAULT 'active',
        referralCode VARCHAR(8) UNIQUE NOT NULL,
        referrerId INT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referrerId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Packages table
    await connection.execute(`
      CREATE TABLE packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('starter', 'pro', 'premium') NOT NULL,
        taskLimit INT NOT NULL,
        skipLimit INT NOT NULL,
        validityDays INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // User packages table
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

    // Tasks table
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

    // Referrals table
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

    // Payments table
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

    // Insert default packages
    await connection.execute(`
      INSERT IGNORE INTO packages (id, name, type, taskLimit, skipLimit, validityDays, price) VALUES
      (1, 'Starter Package', 'starter', 150, 40, 365, 1499.00),
      (2, 'Pro Package', 'pro', 300, 80, 365, 2999.00),
      (3, 'Premium Package', 'premium', 500, 100, 365, 4999.00)
    `);

  } finally {
    connection.release();
  }
}
