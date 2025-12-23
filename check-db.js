const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const users = await prisma.user.findMany()
    console.log('Total users:', users.length)
    console.log('Users:', users)
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
