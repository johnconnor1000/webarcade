const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePassword() {
    try {
        // Update the existing client password
        const updated = await prisma.user.update({
            where: { email: 'prueba@gmail.com' },
            data: {
                password: 'corsa000'
            }
        });

        console.log('✅ Contraseña actualizada exitosamente:');
        console.log('   Email: prueba@gmail.com');
        console.log('   Nueva Password: corsa000');
        console.log('   Rol:', updated.role);

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePassword();
