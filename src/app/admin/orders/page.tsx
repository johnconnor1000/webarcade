import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        include: { user: true, items: { include: { variant: { include: { product: true } } } } },
        orderBy: { createdAt: 'desc' }
    });

    async function updateStatus(formData: FormData) {
        'use server'
        const orderId = formData.get('orderId') as string
        const newStatus = formData.get('status') as string

        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        })

        revalidatePath('/admin/orders')
        revalidatePath('/admin/clients')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Pedidos</h1>
                <Link href="/admin/orders/new" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    + Nuevo Pedido
                </Link>
            </div>

            <div className="space-y-4">
                {orders.map((order) => {
                    const isDelivered = order.status === 'DELIVERED';

                    return (
                        <div key={order.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-white">#{order.id.slice(0, 8)}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                                        order.status === 'PARTIALLY_DELIVERED' ? 'bg-indigo-500/20 text-indigo-400' :
                                            order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {order.status === 'PARTIALLY_DELIVERED' ? 'ENTREGA PARCIAL' : order.status}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm">Cliente: <span className="text-white">{order.user.name}</span></p>
                                <p className="text-slate-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                                    <p className="text-xl font-bold text-white">${order.total.toString()}</p>
                                </div>

                                <Link href={`/admin/orders/${order.id}`} className="px-3 py-1 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 rounded text-sm transition-colors border border-white/10">
                                    Ver Detalle
                                </Link>

                                {!isDelivered && (
                                    <form action={updateStatus} className="flex gap-2">
                                        <input type="hidden" name="orderId" value={order.id} />
                                        <input type="hidden" name="userId" value={order.user.id} />
                                        <input type="hidden" name="total" value={order.total.toString()} />

                                        {order.status === 'PENDING' && (
                                            <button name="status" value="IN_PREPARATION" className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm transition-colors">
                                                Preparar
                                            </button>
                                        )}
                                        {order.status === 'IN_PREPARATION' && (
                                            <button name="status" value="DELIVERED" className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-sm transition-colors border border-green-500/50">
                                                Entregar
                                            </button>
                                        )}
                                    </form>
                                )}
                                {isDelivered && (
                                    <span className="text-sm text-green-500 font-medium flex items-center gap-1">
                                        ✓ Entregado
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
                {orders.length === 0 && (
                    <div className="text-center py-10 text-slate-500">No hay pedidos registrados.</div>
                )}
            </div>
        </div>
    );
}
