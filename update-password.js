const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updatePassword() {
    try {
        const hashedPassword = await bcrypt.hash('corsa000', 10);

        // Update the existing client password
        const updated = await prisma.user.update({
            where: { email: 'prueba@gmail.com' },
            data: {
                password: hashedPassword
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
