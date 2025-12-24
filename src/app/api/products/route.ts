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

        // Apply surcharge if user is retailer
        const products = productsRaw.map(product => {
            let basePrice = Number(product.basePrice);
            if (user?.isRetailer && Number(user.surchargePercentage) > 0) {
                basePrice = basePrice * (1 + Number(user.surchargePercentage) / 100);
            }

            return {
                ...product,
                basePrice: basePrice.toFixed(2),
                variants: product.variants.map(variant => ({
                    ...variant,
                    price: basePrice.toFixed(2) // variants share the product basePrice
                }))
            };
        });


        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }
}
