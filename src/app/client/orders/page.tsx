import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function ClientOrdersPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        redirect("/login");
    }

    // Get all orders for this client
    const orders = await prisma.order.findMany({
        where: { userId: user.id },
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
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Mis Pedidos
                </h1>
                <p className="text-slate-400 mt-2">
                    Historial completo de todos tus pedidos.
                </p>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-slate-500 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-16 h-16 mx-auto mb-4 opacity-50"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-400">No tienes pedidos aún.</p>
                    <p className="text-sm text-slate-500 mt-2">Contacta al administrador para realizar tu primer pedido.</p>
                </div>
            )}
        </div>
    );
}

function OrderCard({ order }: { order: any }) {
    const allItemsReady = order.items.length > 0 && order.items.every((item: any) => item.isReady);
    const isProduction = order.status === 'IN_PRODUCTION';

    return (
        <details className={`bg-slate-900/50 border transition-all overflow-hidden group rounded-2xl ${allItemsReady ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/5 hover:border-indigo-500/20'}`}>
            <summary className="p-6 cursor-pointer list-none">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-white font-semibold">
                                Pedido #{order.id.slice(0, 8)}
                            </h3>
                            <StatusBadge status={order.status} />
                            {allItemsReady && order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
                                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase animate-pulse">
                                    ¡LISTO PARA RETIRAR!
                                </span>
                            )}
                            {isProduction && (
                                <span className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold animate-pulse">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                    EN PRODUCCIÓN...
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                            ${formatCurrency(Number(order.total))}
                        </p>
                        <p className={`text-xs mt-1 group-open:hidden ${allItemsReady ? 'text-green-400 font-medium' : 'text-slate-500'}`}>
                            {allItemsReady ? '¡Todo listo! Click para ver' : 'Click para ver detalles'}
                        </p>
                    </div>
                </div>
            </summary>

            {/* Order Details */}
            <div className="border-t border-white/5 bg-slate-950/50 p-6">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    Productos
                </h4>
                <div className="space-y-3">
                    {order.items.map((item: any) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg"
                        >
                            <div className="flex-1">
                                <p className="text-white font-medium">
                                    {item.variant.product.name}
                                    {item.buttonsType === 'LED' && (
                                        <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase font-bold tracking-tighter">
                                            LED
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-slate-400">
                                    Variante: {item.variant.name}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    Cantidad: {item.quantity} × ${formatCurrency(Number(item.price))}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-semibold">
                                    ${formatCurrency(Number(item.price) * item.quantity)}
                                </p>
                                {item.isReady && (
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1 block">
                                        ✓ Item Listo
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {order.notes && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Notas</p>
                        <p className="text-sm text-slate-300">{order.notes}</p>
                    </div>
                )}
            </div>
        </details>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        IN_PRODUCTION: { label: 'En Producción', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        READY: { label: 'Listo', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        DELIVERED: { label: 'Entregado', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
        CANCELED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`text-xs px-3 py-1 rounded-full border ${config.color} font-medium`}>
            {config.label}
        </span>
    );
}
