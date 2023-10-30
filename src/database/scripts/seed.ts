import { PrismaClient } from '@prisma/client'

import { hash } from '../../lib/hash'

const prisma = new PrismaClient()

async function main() {
  if (process.env.NODE_ENV !== 'test') return

  const password = await hash('Testy123!')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'E2E',
      email: 'admin@test.com',
      password,
      role: 'ADMIN'
    }
  })

  console.log('Admin user created:', adminUser)

  const authUser = await prisma.user.upsert({
    where: { email: 'auth@test.com' },
    update: {},
    create: {
      firstName: 'Auth',
      lastName: 'E2E',
      email: 'auth@test.com',
      password
    }
  })

  console.log('Auth user created:', authUser)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
