'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateClient(clientId: string, data: {
    name?: string,
    email?: string,
    phone?: string,
    isRetailer?: boolean,
    surchargePercentage?: number
}) {
    try {
        await prisma.user.update({
            where: { id: clientId },
            data
        });
        revalidatePath('/admin/clients');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating client:", error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}

export async function resetClientPassword(clientId: string, newPassword: string) {
    try {
        await prisma.user.update({
            where: { id: clientId },
            data: { password: newPassword }
        });
        return { success: true };
    } catch (error) {
        console.error("Error resetting password:", error);
        return { success: false, error };
    }
}
