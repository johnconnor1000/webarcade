import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import OrderForm from "./OrderForm";

export default async function NewOrderPage() {
    const clientsRaw = await prisma.user.findMany({ where: { role: 'CLIENT' } });
    const productsRaw = await prisma.product.findMany({
        where: {},
        include: { variants: true }
    });

    const clients = clientsRaw.map(c => ({
        ...c,
        balance: c.balance.toNumber(),
        isRetailer: c.isRetailer,
        surchargePercentage: Number(c.surchargePercentage),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
    }));

    const products = productsRaw.map(p => ({
        ...p,
        basePrice: p.basePrice.toNumber(),
        ledSurcharge: p.ledSurcharge.toNumber(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        variants: p.variants.map(v => ({
            ...v,
            price: p.basePrice.toNumber() // Each variant defaults to the product's base price
        }))
    }));

    async function createOrder(formData: FormData) {
        'use server'
        const userId = formData.get('userId') as string
        const cartJson = formData.get('cart') as string
        const cart = JSON.parse(cartJson) as {
            variantId: string,
            quantity: number,
            price: number,
            buttonsType: 'COMMON' | 'LED'
        }[]

        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

        // Create Order and OrderItems in a transaction
        await prisma.$transaction([
            prisma.order.create({
                data: {
                    userId,
                    total,
                    status: 'PENDING',
                    items: {
                        create: cart.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.price,
                            buttonsType: item.buttonsType,
                            // Note: we could also snapshot ledSurcharge here by looking it up, 
                            // but for admin manual orders, the price passed in the cart already includes the surcharge.
                        }))
                    }
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: total
                    }
                }
            })
        ])

        revalidatePath('/admin/orders')
        revalidatePath('/admin/clients')
        revalidatePath('/admin/dashboard')
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Nuevo Pedido</h1>
            {clients.length > 0 && products.length > 0 ? (
                <OrderForm clients={clients} products={products} createOrderAction={createOrder} />
            ) : (
                <div className="text-red-400">¡Necesitas tener al menos un Cliente y un Producto creados!</div>
            )}
        </div>
    );
}
