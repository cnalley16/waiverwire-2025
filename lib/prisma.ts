import { PrismaClient } from '../app/generated/prisma'

let prisma: PrismaClient | null = null

// Safely initialize Prisma client with error handling
function initializePrisma(): PrismaClient | null {
  try {
    return new PrismaClient({
      log: ['error'],
    })
  } catch (error) {
    console.warn('Prisma client initialization failed:', error)
    return null
  }
}

// Initialize or get existing Prisma client
function getPrismaClient(): PrismaClient | null {
  if (!prisma) {
    try {
      prisma = initializePrisma()
    } catch (error) {
      console.warn('Failed to initialize Prisma client:', error)
      return null
    }
  }
  return prisma
}

// Export a function that returns the client or null
export function getPrisma(): PrismaClient | null {
  return getPrismaClient()
}

// Export a default instance (for backwards compatibility)
export default getPrismaClient() 