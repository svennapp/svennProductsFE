import { Adapter, AdapterAccount, AdapterSession, AdapterUser } from "next-auth/adapters";
import { executeQuery } from "../db";
import { randomUUID } from "crypto";

export interface ExtendedAdapterUser extends AdapterUser {
  role?: string;
}

export interface ExtendedAdapterAccount extends AdapterAccount {
  userId: string;
}

export function MariaDbAdapter(): Adapter {
  return {
    // Create a user
    async createUser(user: Omit<AdapterUser, "id">): Promise<ExtendedAdapterUser> {
      const id = randomUUID();
      
      await executeQuery(
        `INSERT INTO users (id, name, email, image) VALUES (?, ?, ?, ?)`,
        [id, user.name, user.email, user.image || null]
      );
      
      return {
        id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: "user",
        emailVerified: null,
      } as ExtendedAdapterUser;
    },

    // Get a user by their ID
    async getUser(id: string): Promise<ExtendedAdapterUser | null> {
      const users = await executeQuery<ExtendedAdapterUser[]>(
        `SELECT id, name, email, image, role, created_at as emailVerified FROM users WHERE id = ?`,
        [id]
      );
      return users[0] || null;
    },

    // Get a user by their email
    async getUserByEmail(email: string): Promise<ExtendedAdapterUser | null> {
      const users = await executeQuery<ExtendedAdapterUser[]>(
        `SELECT id, name, email, image, role, created_at as emailVerified FROM users WHERE email = ?`,
        [email]
      );
      return users[0] || null;
    },

    // Get a user by their account information
    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }): Promise<ExtendedAdapterUser | null> {
      const users = await executeQuery<ExtendedAdapterUser[]>(
        `SELECT u.id, u.name, u.email, u.image, u.role, u.created_at as emailVerified 
         FROM users u 
         JOIN accounts a ON u.id = a.user_id 
         WHERE a.provider = ? AND a.provider_account_id = ?`,
        [provider, providerAccountId]
      );
      return users[0] || null;
    },

    // Update a user
    async updateUser(user: Partial<ExtendedAdapterUser> & { id: string }): Promise<ExtendedAdapterUser> {
      const { id, ...userData } = user;
      
      // Build the SET part of the query dynamically based on provided fields
      const fields = Object.keys(userData).filter(key => userData[key as keyof typeof userData] !== undefined);
      
      if (fields.length === 0) return user as ExtendedAdapterUser;
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => userData[field as keyof typeof userData]);
      
      await executeQuery(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      
      const updatedUser = await executeQuery<ExtendedAdapterUser[]>(
        `SELECT id, name, email, image, role, created_at as emailVerified FROM users WHERE id = ?`,
        [id]
      );
      
      return updatedUser[0];
    },

    // Delete a user
    async deleteUser(userId: string): Promise<void> {
      await executeQuery(`DELETE FROM users WHERE id = ?`, [userId]);
    },

    // Link an account to a user
    async linkAccount(account: ExtendedAdapterAccount): Promise<ExtendedAdapterAccount> {
      const id = randomUUID();
      
      await executeQuery(
        `INSERT INTO accounts (
          id, user_id, type, provider, provider_account_id, 
          refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token || null,
          account.access_token || null,
          account.expires_at || null,
          account.token_type || null,
          account.scope || null,
          account.id_token || null,
          account.session_state || null
        ]
      );
      
      return account as ExtendedAdapterAccount;
    },

    // Unlink an account from a user
    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }): Promise<void> {
      await executeQuery(
        `DELETE FROM accounts WHERE provider = ? AND provider_account_id = ?`,
        [provider, providerAccountId]
      );
    },

    // Create a session
    async createSession({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }): Promise<AdapterSession> {
      const id = randomUUID();
      
      await executeQuery(
        `INSERT INTO sessions (id, user_id, expires, session_token) VALUES (?, ?, ?, ?)`,
        [id, userId, expires.toISOString().slice(0, 19).replace('T', ' '), sessionToken]
      );
      
      return {
        id,
        userId,
        sessionToken,
        expires
      } as AdapterSession;
    },

    // Get a session by its token
    async getSessionAndUser(sessionToken: string): Promise<{ session: AdapterSession; user: ExtendedAdapterUser } | null> {
      const sessions = await executeQuery<AdapterSession[]>(
        `SELECT id, user_id as userId, expires, session_token as sessionToken FROM sessions WHERE session_token = ?`,
        [sessionToken]
      );
      
      if (!sessions[0]) return null;
      
      const users = await executeQuery<ExtendedAdapterUser[]>(
        `SELECT id, name, email, image, role, created_at as emailVerified FROM users WHERE id = ?`,
        [sessions[0].userId]
      );
      
      if (!users[0]) return null;
      
      return {
        session: sessions[0],
        user: users[0]
      };
    },

    // Update a session
    async updateSession({ sessionToken, expires, userId }: Partial<AdapterSession> & { sessionToken: string }): Promise<AdapterSession | null> {
      let query = `SELECT id, user_id as userId, expires, session_token as sessionToken FROM sessions WHERE session_token = ?`;
      let data: any[] = [sessionToken];
      
      if (expires) {
        query = `UPDATE sessions SET expires = ? WHERE session_token = ?`;
        data = [expires.toISOString().slice(0, 19).replace('T', ' '), sessionToken];
      }
      
      if (userId) {
        query = `UPDATE sessions SET user_id = ? WHERE session_token = ?`;
        data = [userId, sessionToken];
      }
      
      if (expires && userId) {
        query = `UPDATE sessions SET expires = ?, user_id = ? WHERE session_token = ?`;
        data = [expires.toISOString().slice(0, 19).replace('T', ' '), userId, sessionToken];
      }
      
      await executeQuery(query, data);
      
      const sessions = await executeQuery<AdapterSession[]>(
        `SELECT id, user_id as userId, expires, session_token as sessionToken FROM sessions WHERE session_token = ?`,
        [sessionToken]
      );
      
      return sessions[0] || null;
    },

    // Delete a session
    async deleteSession(sessionToken: string): Promise<void> {
      await executeQuery(`DELETE FROM sessions WHERE session_token = ?`, [sessionToken]);
    },
  };
}
