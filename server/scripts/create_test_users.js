import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const dbConfig = {
  host: 'swift.herosite.pro',
  user: 'starsflock',
  password: 'Nitish@123',
  database: 'instarsflock',
  port: 3306
};

async function createTestUsers() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Creating test users with wallets...');
    
    // Get all packages
    const [packages] = await connection.execute('SELECT * FROM packages WHERE isActive = 1');
    
    if (packages.length === 0) {
      console.log('No packages found. Please create packages first.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create 5 new test users
    const testUsers = [
      { name: 'Test User 1', email: 'testuser1@example.com' },
      { name: 'Test User 2', email: 'testuser2@example.com' },
      { name: 'Test User 3', email: 'testuser3@example.com' },
      { name: 'Test User 4', email: 'testuser4@example.com' },
      { name: 'Test User 5', email: 'testuser5@example.com' }
    ];
    
    for (const testUser of testUsers) {
      // Check if user exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [testUser.email]
      );
      
      if (existingUser.length > 0) {
        console.log(`User ${testUser.email} already exists, skipping...`);
        continue;
      }
      
      const referralCode = nanoid(8);
      
      // Create user
      const [userResult] = await connection.execute(
        `INSERT INTO users (name, email, password, role, status, referralCode, wallet_balance) 
         VALUES (?, ?, ?, 'vendor', 'active', ?, 500.00)`,
        [testUser.name, testUser.email, hashedPassword, referralCode]
      );
      
      const userId = userResult.insertId;
      
      // Assign random package
      const randomPackage = packages[Math.floor(Math.random() * packages.length)];
      const expiresAt = new Date(Date.now() + (randomPackage.validityDays * 24 * 60 * 60 * 1000));
      
      await connection.execute(
        `INSERT INTO user_packages (userId, packageId, expiresAt, tasksUsed, skipsUsed) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, randomPackage.id, expiresAt, 0, 0]
      );
      
      // Add some wallet transactions using the correct column name
      for (let j = 0; j < 3; j++) {
        const amount = Math.floor(Math.random() * 100) + 50;
        const daysAgo = Math.floor(Math.random() * 7);
        const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        
        await connection.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at) 
           VALUES (?, 'credit', ?, ?, 'completed', ?)`,
          [userId, amount, `Task completion bonus - #${j + 1}`, createdAt]
        );
      }
      
      console.log(`Created user: ${testUser.name} with package: ${randomPackage.name}`);
    }
    
    console.log('Successfully created test users with wallets!');
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await connection.end();
  }
}

createTestUsers().catch(console.error);