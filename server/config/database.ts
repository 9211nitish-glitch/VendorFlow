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
    // Only create tables if they don't exist (preserve existing data)

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
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

    // Disable foreign key checks temporarily to update packages table
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

    // Insert packages from Stars Flock with detailed features
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
    
    // Re-enable foreign key checks
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);

  } finally {
    connection.release();
  }
}
