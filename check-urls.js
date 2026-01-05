const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrls() {
    console.log('--- Verificando URLs de variantes ---');
    const variants = await prisma.productVariant.findMany({
        where: { imageUrl: { not: null } },
        take: 10
    });

    if (variants.length === 0) {
        console.log('No se encontraron variantes con imagen.');
    } else {
        variants.forEach(v => {
            console.log(`Variante: ${v.name} | URL: ${v.imageUrl}`);
        });
    }

    console.log('\n--- Verificando URLs de productos ---');
    const products = await prisma.product.findMany({
        where: { imageUrl: { not: null } },
        take: 10
    });

    if (products.length === 0) {
        console.log('No se encontraron productos con imagen.');
    } else {
        products.forEach(p => {
            console.log(`Producto: ${p.name} | URL: ${p.imageUrl}`);
        });
    }

    await prisma.$disconnect();
}

checkUrls().catch(e => {
    console.error(e);
    process.exit(1);
});
