// app/auth.ts
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import type { DefaultSession, AuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

// Hardcoded users for demonstration purposes
// In a real application, these would come from a database
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@svenn.com',
    password: 'password123',
  },
  {
    id: '2',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
  },
]

export const authOptions: AuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Find user with matching email
        const user = users.find(user => user.email === credentials.email)
        
        // Check if user exists and password matches
        if (user && user.password === credentials.password) {
          // Return user without the password
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        }
        
        // Authentication failed
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
      }
      return session
    },
  },
  // For better security in production
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
