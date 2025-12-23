const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting manual seed...')
    try {
        // Upsert Admin User
        const admin = await prisma.user.upsert({
            where: { email: 'admin@pedidos.com' },
            update: {},
            create: {
                email: 'admin@pedidos.com',
                name: 'Admin Jota',
                password: 'hashed_password_placeholder',
                role: 'ADMIN',
            },
        })
        console.log('Admin user ensured:', admin)

        // Create Sample Product if none exists
        const count = await prisma.product.count()
        if (count === 0) {
            const product = await prisma.product.create({
                data: {
                    name: 'Mesa Ratona Industrial',
                    description: 'Mesa de hierro y madera, estilo industrial premium.',
                    price: 15150.00,
                    stock: 5,
                },
            })
            console.log('Sample product created:', product)
        } else {
            console.log('Products already exist.')
        }

    } catch (e) {
        console.error('Error seeding:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
