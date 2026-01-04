import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Get current user
    const rawUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 5,
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
            },
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 3
            }
        }
    });

    if (!rawUser) {
        redirect("/login");
    }

    // Verify user has CLIENT role
    if (rawUser.role !== 'CLIENT') {
        redirect('/admin'); // Redirect admins to admin panel
    }

    // Convert to strict plain object
    const user = {
        name: String(rawUser.name || 'Cliente'),
        balance: Number(rawUser.balance || 0),
        id: String(rawUser.id || ''),
        orders: rawUser.orders.map(order => ({
            id: String(order.id || ''),
            createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date().toISOString(),
            status: String(order.status || 'PENDING'),
            total: order.total ? String(order.total) : '0',
            items: order.items.map(item => ({
                id: String(item.id || '')
            }))
        })),
        payments: rawUser.payments.map(payment => ({
            id: String(payment.id || ''),
            amount: payment.amount ? String(payment.amount) : '0',
            createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
            method: String(payment.method || 'OTROS'),
            type: String(payment.type || 'GENERAL')
        }))
    }

    const balance = Number(user.balance);
    const isDebtor = balance > 0;
    const totalOrders = await prisma.order.count({ where: { userId: user.id } });
    const totalPaid = await prisma.payment.aggregate({
        where: { userId: user.id },
        _sum: { amount: true }
    });

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Hola, {user.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 mt-2">
                    Bienvenido a tu panel de cliente. Aquí puedes ver tu cuenta y pedidos.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Link href="/client/statement" className="block group">
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl group-hover:border-indigo-500/30 transition-all group-hover:shadow-lg group-hover:shadow-indigo-500/5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-slate-400">Saldo Actual</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </div>
                        <div className={`text-3xl font-bold ${isDebtor ? 'text-red-500' : 'text-green-500'}`}>
                            ${formatCurrency(balance)}
                        </div>
                        <div className="text-sm mt-2 text-slate-500">
                            {isDebtor ? 'Deuda pendiente' : balance < 0 ? 'A tu favor' : 'Sin deuda'}
                        </div>
                    </div>
                </Link>

                {/* Total Orders */}
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Total de Pedidos</h3>
                    <div className="text-3xl font-bold text-white">{totalOrders}</div>
                    <div className="text-sm mt-2 text-slate-500">
                        Pedidos realizados
                    </div>
                </div>

                {/* Total Paid */}
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Total Pagado</h3>
                    <div className="text-3xl font-bold text-white">
                        ${formatCurrency(Number(totalPaid._sum.amount || 0))}
                    </div>
                    <div className="text-sm mt-2 text-slate-500">
                        Pagos acumulados
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Pedidos Recientes</h2>
                    <Link
                        href="/client/orders"
                        className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                        Ver todos →
                    </Link>
                </div>

                {user.orders.length > 0 ? (
                    <div className="space-y-3">
                        {user.orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-slate-950/50 border border-white/5 p-4 rounded-lg hover:border-indigo-500/20 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString('es-AR')}
                                        </p>
                                        <p className="text-white font-medium mt-1">
                                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={order.status} />
                                        <p className="text-white font-bold mt-1">
                                            ${formatCurrency(Number(order.total))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        No tienes pedidos aún.
                    </div>
                )}
            </div>

            {/* Recent Payments */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Pagos Recientes</h2>
                    <Link
                        href="/client/payments"
                        className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                        Ver todos →
                    </Link>
                </div>

                {user.payments.length > 0 ? (
                    <div className="space-y-3">
                        {user.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="bg-slate-950/50 border border-white/5 p-4 rounded-lg flex items-center justify-between"
                            >
                                <div>
                                    <p className="text-white font-medium">
                                        ${formatCurrency(Number(payment.amount))}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {new Date(payment.createdAt).toLocaleDateString('es-AR')} · {payment.method}
                                    </p>
                                </div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">
                                    {payment.type}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        No hay pagos registrados.
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Pendiente', color: 'bg-amber-500/10 text-amber-500' },
        CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500/10 text-blue-500' },
        IN_PRODUCTION: { label: 'En Producción', color: 'bg-purple-500/10 text-purple-500' },
        READY: { label: 'Listo', color: 'bg-green-500/10 text-green-500' },
        DELIVERED: { label: 'Entregado', color: 'bg-slate-500/10 text-slate-500' },
        CANCELED: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
            {config.label}
        </span>
    );
}
