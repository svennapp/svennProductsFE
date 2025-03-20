// scripts/create-user.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'svennproducts',
  port: parseInt(process.env.DB_PORT || '3306'),
};

console.log('Using database:', dbConfig.database);

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function createUser(name, email, password, role = 'user') {
  // Create a connection
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Start transaction
    await connection.beginTransaction();
    
    // Generate user ID
    const userId = randomUUID();
    
    // Insert user
    await connection.execute(
      `INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)`,
      [userId, name, email, role]
    );
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Insert credentials
    await connection.execute(
      `INSERT INTO user_credentials (id, user_id, password_hash) VALUES (UUID(), ?, ?)`,
      [userId, hashedPassword]
    );
    
    // Commit transaction
    await connection.commit();
    
    console.log(`User created successfully: ${name} (${email})`);
    return { id: userId, name, email, role };
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error('Error creating user:', error);
    throw error;
  } finally {
    // Close connection
    await connection.end();
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node create-user.js <name> <email> <password> [role]');
  process.exit(1);
}

const [name, email, password, role = 'user'] = args;

// Create user
createUser(name, email, password, role)
  .then(() => {
    console.log('User creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('User creation failed:', error);
    process.exit(1);
  });
