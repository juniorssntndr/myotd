import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Testing connection...')
    const brandsCount = await prisma.brand.count()
    console.log(`Connection successful! Brands count: ${brandsCount}`)
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
