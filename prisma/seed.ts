const { PrismaClient } = require('@prisma/client')
const prismaClient = new PrismaClient()

async function main() {
    // Upsert Admin User
    const admin = await prismaClient.user.upsert({
        where: { email: 'fabricadearcades1000@gmail.com' },
        update: {
            password: 'corsa000',
            role: 'ADMIN'
        },
        create: {
            email: 'fabricadearcades1000@gmail.com',
            name: 'Administrador',
            password: 'corsa000',
            role: 'ADMIN',
        },
    })

    // Create Sample Product
    const product = await prismaClient.product.create({
        data: {
            name: 'Mesa Ratona Industrial',
            description: 'Mesa de hierro y madera, estilo industrial premium.',
            imageUrl: 'https://placehold.co/600x400',
            category: 'General',
            variants: {
                create: [
                    { name: '80x40cm', price: 15150.00 },
                    { name: '100x50cm', price: 18500.00 },
                ]
            }
        },
    })

    console.log({ admin, product })
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
        process.exit(1)
    })
