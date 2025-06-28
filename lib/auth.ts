import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getPrisma } from './prisma'

export const authOptions: NextAuthOptions = {
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

        try {
          const prisma = getPrisma()
          
          if (prisma) {
            // Try to find or create user in database
            let user = await prisma.user.findUnique({
              where: { email: credentials.email as string }
            })

            if (!user) {
              // Auto-create user for demo purposes
              const username = (credentials.email as string).split('@')[0]
              user = await prisma.user.create({
                data: {
                  email: credentials.email as string,
                  firstName: 'Demo',
                  lastName: 'User',
                  username: username,
                }
              })
            }

            return {
              id: user.id,
              email: user.email,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            }
          } else {
            // Demo mode - create a mock user without database
            console.log('Operating in demo mode without database')
            const username = (credentials.email as string).split('@')[0]
            return {
              id: 'demo-' + Date.now(),
              email: credentials.email as string,
              username: username,
              firstName: 'Demo',
              lastName: 'User',
            }
          }
        } catch (error) {
          console.warn('Database operation failed, falling back to demo mode:', error)
          // Fallback to demo mode
          const username = (credentials.email as string).split('@')[0]
          return {
            id: 'demo-' + Date.now(),
            email: credentials.email as string,
            username: username,
            firstName: 'Demo',
            lastName: 'User',
          }
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.firstName = token.firstName as string | null
        session.user.lastName = token.lastName as string | null
        session.user.name = `${token.firstName || 'Demo'} ${token.lastName || 'User'}`
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-for-development',
} 