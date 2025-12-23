import { getOrderDetails } from '@/app/actions/order-actions'
import OrderItemToggle from './item-toggle'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrderDetails(id)

    if (!order) {
        notFound()
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Detalle de Pedido</h1>
                <Link href="/admin/orders" className="text-blue-500 hover:underline">
                    &larr; Volver a Pedidos
                </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-white">Información del Cliente</h2>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Nombre:</span> {order.user.name || 'N/A'}</p>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Email:</span> {order.user.email}</p>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Teléfono:</span> {order.user.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-2 text-white">Información del Pedido</h2>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">ID:</span> {order.id}</p>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Estado:</span> <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-sm">{order.status}</span></p>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Fecha:</span> {order.createdAt.toLocaleDateString()}</p>
                        <p className="text-slate-300"><span className="font-medium text-slate-400">Total:</span> ${Number(order.total).toFixed(2)}</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-4 mt-8 border-b border-slate-700 pb-2 text-white">Productos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/50">
                                <th className="p-3 border-b border-slate-700 text-slate-400">Producto</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Variante</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Cantidad</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Precio Unit.</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Subtotal</th>
                                <th className="p-3 border-b border-slate-700 text-slate-400">Estado (Listo?)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800 border-b border-slate-700 text-slate-300">
                                    <td className="p-3">{item.variant.product.name}</td>
                                    <td className="p-3">{item.variant.name}</td>
                                    <td className="p-3">{item.quantity}</td>
                                    <td className="p-3">${Number(item.price).toFixed(2)}</td>
                                    <td className="p-3 font-medium text-white">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                                    <td className="p-3">
                                        <OrderItemToggle itemId={item.id} isReady={item.isReady} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {order.notes && (
                    <div className="mt-6 bg-yellow-900/10 p-4 rounded border border-yellow-800/30">
                        <h3 className="font-semibold text-yellow-500">Notas:</h3>
                        <p className="text-slate-300">{order.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
