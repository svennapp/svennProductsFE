import bcrypt from 'bcryptjs';
import { executeQuery } from '../db';

// Hash a password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify a password against a hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create user credentials in the database
export async function createUserCredentials(userId: string, password: string): Promise<void> {
  const hashedPassword = await hashPassword(password);
  
  await executeQuery(
    `INSERT INTO user_credentials (id, user_id, password_hash) VALUES (UUID(), ?, ?)`,
    [userId, hashedPassword]
  );
}

// Get user credentials by user ID
export async function getUserCredentials(userId: string): Promise<{ id: string; password_hash: string } | null> {
  const credentials = await executeQuery<Array<{ id: string; password_hash: string }>>(
    `SELECT id, password_hash FROM user_credentials WHERE user_id = ?`,
    [userId]
  );
  
  return credentials[0] || null;
}

// Verify user credentials
export async function verifyUserCredentials(email: string, password: string): Promise<{ id: string; name: string; email: string; image: string | null; role: string } | null> {
  // Get user by email
  const users = await executeQuery<Array<{ id: string; name: string; email: string; image: string | null; role: string }>>(
    `SELECT id, name, email, image, role FROM users WHERE email = ?`,
    [email]
  );
  
  if (!users[0]) return null;
  
  // Get user credentials
  const credentials = await getUserCredentials(users[0].id);
  if (!credentials) return null;
  
  // Verify password
  const isValid = await verifyPassword(password, credentials.password_hash);
  if (!isValid) return null;
  
  return users[0];
}
