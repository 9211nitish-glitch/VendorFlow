-- Add wallet and account details fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('credit', 'debit') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  task_id INT,
  reference_id VARCHAR(100),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

-- Add payment_per_task to packages table
ALTER TABLE packages ADD COLUMN IF NOT EXISTS payment_per_task DECIMAL(10,2) DEFAULT 0.00;

-- Update existing packages with payment amounts
UPDATE packages SET payment_per_task = 50.00 WHERE name = 'New Star Bundle';
UPDATE packages SET payment_per_task = 75.00 WHERE name = 'Rising Star Starter';
UPDATE packages SET payment_per_task = 100.00 WHERE name = 'Shining Star Pack';
UPDATE packages SET payment_per_task = 125.00 WHERE name = 'Superstar Elite Plan';
UPDATE packages SET payment_per_task = 150.00 WHERE name = 'Legendary Star Package';
UPDATE packages SET payment_per_task = 25.00 WHERE name = 'Fresh Face Trial';
UPDATE packages SET payment_per_task = 50.00 WHERE name = 'Fresh Face Star';
UPDATE packages SET payment_per_task = 75.00 WHERE name = 'Next Level Creator';
UPDATE packages SET payment_per_task = 100.00 WHERE name = 'Influence Empire';
UPDATE packages SET payment_per_task = 125.00 WHERE name = 'SuperStar Pro Package';
UPDATE packages SET payment_per_task = 150.00 WHERE name = 'Legendary Creator Kit';