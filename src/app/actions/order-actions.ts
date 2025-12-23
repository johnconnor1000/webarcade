'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOrderDetails(orderId: string) {
  if (!orderId) return null;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
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
    })
    return order
  } catch (error) {
    console.error("Error fetching order details:", error);
    return null;
  }
}

export async function toggleOrderItemStatus(itemId: string, isReady: boolean) {
  try {
    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: { isReady },
      select: { orderId: true }
    });

    if (item) {
      revalidatePath(`/admin/orders/${item.orderId}`);
      revalidatePath('/admin/production');
    }
    return { success: true };
  } catch (error) {
    console.error("Error toggling item status:", error);
    return { success: false, error };
  }
}
