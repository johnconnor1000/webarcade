import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        const user = session?.user?.email
            ? (await prisma.user.findUnique({ where: { email: session.user.email } }) as any)
            : null;

        const productsRaw = await prisma.product.findMany({
            include: {
                variants: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Filter by allowed categories if user has restrictions
        let filteredProducts = productsRaw;
        if (user?.allowedCategories && user.allowedCategories.length > 0) {
            filteredProducts = productsRaw.filter(product =>
                product.category && user.allowedCategories.includes(product.category)
            );
        }

        // Apply surcharge and sanitize for JSON serialization
        const products = filteredProducts.map(product => {
            let basePrice = Number(product.basePrice || 0);
            if (user?.isRetailer && Number(user.surchargePercentage) > 0) {
                basePrice = basePrice * (1 + Number(user.surchargePercentage) / 100);
            }

            return {
                id: String(product.id || ''),
                name: String(product.name || 'Sin nombre'),
                description: product.description,
                imageUrl: product.imageUrl,
                category: product.category,
                subcategory: product.subcategory,
                basePrice: basePrice.toFixed(2),
                ledSurcharge: product.ledSurcharge ? String(product.ledSurcharge) : '0',
                createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : undefined,
                updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : undefined,
                variants: (product.variants || []).map(variant => ({
                    id: String(variant.id || ''),
                    productId: String(variant.productId || ''),
                    name: String(variant.name || 'N/A'),
                    imageUrl: (variant as any).imageUrl,
                    price: basePrice.toFixed(2)
                }))
            };
        });


        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}
