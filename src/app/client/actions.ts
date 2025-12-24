'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface CartItem {
    variantId: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    buttonsType: 'COMMON' | 'LED';
}


export async function createOrder(items: CartItem[], notes?: string) {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: 'No autenticado' };
    }

    try {
        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        }) as any;

        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Verify user is a client
        if (user.role !== 'CLIENT') {
            return { success: false, error: 'Solo los clientes pueden crear pedidos' };
        }

        // Validate all variants exist and get current prices
        const variantIds = items.map(item => item.variantId);
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true }
        });

        if (variants.length !== items.length) {
            return { success: false, error: 'Algunos productos ya no están disponibles' };
        }

        // Calculate total using current prices from database
        let total = 0;
        const orderItems = items.map(item => {
            const variant = variants.find(v => v.id === item.variantId);
            if (!variant) {
                throw new Error(`Variante ${item.variantId} no encontrada`);
            }

            let price = Number(variant.product.basePrice);
            const ledSurcharge = item.buttonsType === 'LED' ? Number(variant.product.ledSurcharge || 0) : 0;

            // Apply surcharge if user is retailer
            if (user.isRetailer && Number(user.surchargePercentage) > 0) {
                price = price * (1 + Number(user.surchargePercentage) / 100);
            }


            const finalItemPrice = price + ledSurcharge;
            total += finalItemPrice * item.quantity;

            return {
                variantId: item.variantId,
                quantity: item.quantity,
                price: finalItemPrice,
                buttonsType: item.buttonsType,
                ledSurchargeSnapshot: ledSurcharge
            };
        });


        // Create order with items
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                total: total,
                status: 'PENDING',
                notes: notes || null,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        // Update user balance (increase debt)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                balance: {
                    increment: total
                }
            }
        });

        revalidatePath('/client/orders');
        revalidatePath('/client');

        return {
            success: true,
            orderId: order.id,
            total: Number(total)
        };

    } catch (error) {
        console.error('Error creating order:', error);
        return {
            success: false,
            error: 'Error al crear el pedido. Por favor intenta de nuevo.'
        };
    }
}
