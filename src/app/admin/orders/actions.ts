'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface DeliveryItem {
    itemId: string;
    quantityToDeliver: number;
}

export async function registerDelivery(orderId: string, deliveryItems: DeliveryItem[]) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch the order and its items
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true, user: true }
            });

            if (!order) throw new Error("Pedido no encontrado");

            let totalValueDelivered = 0;
            let allItemsFullyDelivered = true;

            // 2. Process each delivery item
            for (const deliveryItem of deliveryItems) {
                const item = order.items.find(i => i.id === deliveryItem.itemId);
                if (!item) continue;

                const newDeliveredQuantity = item.deliveredQuantity + deliveryItem.quantityToDeliver;

                if (newDeliveredQuantity > item.quantity) {
                    throw new Error(`Cantidad a entregar para item ${item.id} excede el total pedido`);
                }

                // Update the item
                await tx.orderItem.update({
                    where: { id: item.id },
                    data: { deliveredQuantity: newDeliveredQuantity }
                });

                // Add to total delivered value
                totalValueDelivered += Number(item.price) * deliveryItem.quantityToDeliver;

                if (newDeliveredQuantity < item.quantity) {
                    allItemsFullyDelivered = false;
                }
            }

            // Check if other items (not in deliveryItems) are fully delivered
            const processedItemIds = deliveryItems.map(di => di.itemId);
            for (const item of order.items) {
                if (!processedItemIds.includes(item.id)) {
                    if (item.deliveredQuantity < item.quantity) {
                        allItemsFullyDelivered = false;
                    }
                }
            }

            // 3. Update Order Status
            const newStatus = allItemsFullyDelivered ? 'DELIVERED' : 'PARTIALLY_DELIVERED';
            await tx.order.update({
                where: { id: orderId },
                data: { status: newStatus }
            });

            // 4. Update User Balance (accrue debt)
            if (totalValueDelivered > 0) {
                await tx.user.update({
                    where: { id: order.userId },
                    data: {
                        balance: { increment: totalValueDelivered }
                    }
                });
            }

            return { success: true, newStatus };
        });

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        revalidatePath('/admin/clients');
        revalidatePath(`/admin/clients/${orderId}`); // Assuming client detail page uses ID

        return result;
    } catch (error: any) {
        console.error("Error registering delivery:", error);
        return { success: false, error: error.message || "Error al registrar la entrega" };
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        })

        revalidatePath('/admin/orders')
        revalidatePath('/admin/clients')
        return { success: true }
    } catch (error) {
        console.error("Error updating order status:", error)
        return { success: false, error: "Error al actualizar el estado" }
    }
}
