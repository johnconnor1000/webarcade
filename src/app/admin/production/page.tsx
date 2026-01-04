import prisma from "@/lib/prisma";
import OrderItemToggle from "../orders/[id]/item-toggle";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
    const rawPendingItems = await prisma.orderItem.findMany({
        where: {
            isReady: false,
            order: {
                status: {
                    not: 'DELIVERED' // Only show items from orders that are not delivered yet
                }
            }
        },
        include: {
            variant: {
                include: {
                    product: {
                        select: { name: true }
                    }
                }
            },
            order: {
                include: {
                    user: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: {
            order: {
                createdAt: 'asc'
            }
        }
    });

    const pendingItems = rawPendingItems.map(item => ({
        id: String(item.id || ''),
        quantity: Number(item.quantity || 0),
        isReady: Boolean(item.isReady),
        variant: {
            name: String(item.variant?.name || 'Incompleta'),
            product: {
                name: String(item.variant?.product?.name || 'Producto sin nombre')
            }
        },
        order: {
            id: String(item.order?.id || ''),
            user: {
                name: String(item.order?.user?.name || 'Cliente desconocido')
            }
        }
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Producción (Pendientes)</h1>

            <div className="bg-slate-900 border border-slate-800 shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="p-3 border-b border-slate-700 text-slate-400">Producto</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Variante</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Cantidad</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Orden / Cliente</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800 border-b border-slate-700 text-slate-300">
                                    <td className="p-3">{item.variant?.product?.name || 'Producto sin nombre'}</td>
                                    <td className="p-3">{item.variant?.name || 'N/A'}</td>
                                    <td className="p-3">{item.quantity}</td>
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">#{item.order?.id?.slice(0, 8) || 'N/A'}</span>
                                            <span className="text-xs text-slate-500">{item.order?.user?.name || 'Cliente desconocido'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <OrderItemToggle itemId={item.id} isReady={item.isReady} />
                                    </td>
                                </tr>
                            ))}
                            {pendingItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No hay productos pendientes de producción.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
