import prisma from "@/lib/prisma";
import OrderItemToggle from "../orders/[id]/item-toggle";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
    try {
        const rawPendingItems = await prisma.orderItem.findMany({
            where: {
                isReady: false,
                order: {
                    status: {
                        not: 'DELIVERED'
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

        const pendingItems = (rawPendingItems || []).map(item => {
            return {
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
            };
        });

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Producción (Pendientes)</h1>
                    <span className="text-[10px] text-slate-700 bg-slate-900 border border-white/5 px-2 py-0.5 rounded font-mono">v1.0.4-defensive</span>
                </div>

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
                                        <td className="p-3 font-medium text-white">{item.variant.product.name}</td>
                                        <td className="p-3 text-slate-400">{item.variant.name}</td>
                                        <td className="p-3 text-white font-bold">{item.quantity}</td>
                                        <td className="p-3 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium">#{String(item.order.id).slice(0, 8)}</span>
                                                <span className="text-xs text-slate-500">{item.order.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <OrderItemToggle itemId={item.id} isReady={item.isReady} />
                                        </td>
                                    </tr>
                                ))}
                                {pendingItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
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
    } catch (error) {
        console.error("Critical error in production page:", error);
        return (
            <div className="p-8 bg-red-900/10 border border-red-500/20 rounded-2xl text-center shadow-2xl">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-xl font-bold text-white mb-2">Error de Carga (v1.0.4)</h2>
                <p className="text-red-400/80 max-w-md mx-auto">
                    No se pudo cargar la lista de producción. Esto puede deberse a datos inconsistentes en la base de datos.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    Reintentar cargar página
                </button>
            </div>
        );
    }
}
