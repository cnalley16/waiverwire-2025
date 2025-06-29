import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Simple demo authentication - in production this would check against database
        if (credentials.email === "demo@waiverwire.com" && credentials.password === "password123") {
          return {
            id: "demo-user-id",
            email: credentials.email,
            name: "Demo User",
            username: "demo",
          };
        }

        if (credentials.email === "admin@waiverwire.com" && credentials.password === "password123") {
          return {
            id: "admin-user-id",
            email: credentials.email,
            name: "Admin User",
            username: "admin",
          };
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        (session.user as any).username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret",
}

// Export alias for backwards compatibility
export const authOptions = authConfig 