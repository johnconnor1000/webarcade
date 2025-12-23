const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestClient() {
    try {
        // Delete existing test client if exists
        await prisma.user.deleteMany({
            where: { email: 'cliente@test.com' }
        });

        // Create new test client
        const client = await prisma.user.create({
            data: {
                email: 'cliente@test.com',
                password: 'test123',
                name: 'Cliente de Prueba',
                role: 'CLIENT',
                phone: '1234567890',
                balance: 500.00
            }
        });

        console.log('✅ Cliente de prueba creado exitosamente:');
        console.log('   Email: cliente@test.com');
        console.log('   Password: test123');
        console.log('   Role:', client.role);
        console.log('   Balance:', client.balance);

    } catch (error) {
        console.error('Error creating test client:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestClient();
