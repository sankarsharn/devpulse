import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  // 1. Create a connection pool using your DATABASE_URL
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  
  // 2. Create the adapter
  const adapter = new PrismaPg(pool)
  
  // 3. Pass the adapter to the PrismaClient
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma