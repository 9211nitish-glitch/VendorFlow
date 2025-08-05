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

const randomNames = [
  'Priya Sharma', 'Rahul Kumar', 'Anita Singh', 'Vikash Gupta', 'Neha Patel',
  'Suresh Yadav', 'Kavita Joshi', 'Amit Verma', 'Sunita Rani', 'Deepak Tiwari',
  'Rekha Devi', 'Manoj Kumar', 'Preeti Agarwal', 'Ravi Shankar', 'Pooja Mishra'
];

const randomEmails = [
  'priya.sharma@gmail.com', 'rahul.kumar@gmail.com', 'anita.singh@gmail.com',
  'vikash.gupta@gmail.com', 'neha.patel@gmail.com', 'suresh.yadav@gmail.com',
  'kavita.joshi@gmail.com', 'amit.verma@gmail.com', 'sunita.rani@gmail.com',
  'deepak.tiwari@gmail.com', 'rekha.devi@gmail.com', 'manoj.kumar@gmail.com',
  'preeti.agarwal@gmail.com', 'ravi.shankar@gmail.com', 'pooja.mishra@gmail.com'
];

const sampleBios = [
  'Content creator passionate about digital marketing',
  'Social media enthusiast from Mumbai',
  'Tech blogger and influencer',
  'Digital marketing expert',
  'Social media strategist',
  'Content writer and blogger',
  'Online entrepreneur',
  'Digital content creator',
  'Social media manager',
  'Freelance digital marketer'
];

const phoneNumbers = [
  '9876543210', '8765432109', '7654321098', '9123456789', '8234567890',
  '7345678901', '9456789012', '8567890123', '7678901234', '9789012345',
  '8890123456', '7901234567', '9012345678', '8123456789', '7234567890'
];

async function createRandomUsers() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('Creating 15 random users with packages...');
    
    // Get all packages
    const [packages] = await connection.execute('SELECT * FROM packages WHERE isActive = 1');
    
    if (packages.length === 0) {
      console.log('No packages found. Please create packages first.');
      return;
    }
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    for (let i = 0; i < 15; i++) {
      const name = randomNames[i];
      const email = randomEmails[i];
      const phone = phoneNumbers[i];
      const bio = sampleBios[i % sampleBios.length];
      const referralCode = nanoid(8);
      
      // Create user (skip if exists)
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUser.length > 0) {
        console.log(`User ${email} already exists, skipping...`);
        continue;
      }
      
      const [userResult] = await connection.execute(
        `INSERT INTO users (name, email, password, role, status, referralCode, bio, phone, wallet_balance) 
         VALUES (?, ?, ?, 'vendor', 'active', ?, ?, ?, 0.00)`,
        [name, email, hashedPassword, referralCode, bio, phone]
      );
      
      const userId = userResult.insertId;
      
      // Assign random package
      const randomPackage = packages[Math.floor(Math.random() * packages.length)];
      const expiresAt = new Date(Date.now() + (randomPackage.validityDays * 24 * 60 * 60 * 1000));
      
      await connection.execute(
        `INSERT INTO user_packages (userId, packageId, expiresAt, tasksUsed, skipsUsed) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, randomPackage.id, expiresAt, 
         Math.floor(Math.random() * 5), // Random tasks used (0-4)
         Math.floor(Math.random() * 3)  // Random skips used (0-2)
        ]
      );
      
      // Add some random wallet balance and transactions
      const randomBalance = Math.floor(Math.random() * 1000) + 100; // 100-1100 rupees
      
      await connection.execute(
        'UPDATE users SET wallet_balance = ? WHERE id = ?',
        [randomBalance, userId]
      );
      
      // Add some earning transactions
      const earningsCount = Math.floor(Math.random() * 10) + 3; // 3-12 transactions
      for (let j = 0; j < earningsCount; j++) {
        const amount = Math.floor(Math.random() * 150) + 25; // 25-175 rupees per task
        const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
        const createdAt = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        
        await connection.execute(
          `INSERT INTO wallet_transactions (user_id, type, amount, description, status, created_at) 
           VALUES (?, 'credit', ?, ?, 'completed', ?)`,
          [userId, amount, `Task completion reward - Task #${j + 1}`, createdAt]
        );
      }
      
      console.log(`Created user: ${name} with package: ${randomPackage.name} and balance: ₹${randomBalance}`);
    }
    
    console.log('Successfully created 15 random users with packages and wallet history!');
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await connection.end();
  }
}

createRandomUsers().catch(console.error);