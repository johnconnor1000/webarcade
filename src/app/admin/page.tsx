import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const session = await auth();

    // Fetch real stats
    const [pendingOrders, inProductionOrders, monthlyRevenueRaw, recentOrders, recentPayments] = await Promise.all([
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'IN_PRODUCTION' } }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                },
                status: { not: 'CANCELED' }
            }
        }),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        }),
        prisma.payment.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        })
    ]);

    const monthlyRevenue = Number(monthlyRevenueRaw._sum.total || 0);

    // Combine and sort recent activity
    const recentActivity = [
        ...recentOrders.map(o => ({
            id: o.id,
            type: 'ORDER',
            user: o.user?.name || 'Cliente desconocido',
            amount: Number(o.total || 0),
            date: o.createdAt ? new Date(o.createdAt) : new Date(),
            status: o.status
        })),
        ...recentPayments.map(p => ({
            id: p.id,
            type: 'PAYMENT',
            user: p.user?.name || 'Cliente desconocido',
            amount: Number(p.amount || 0),
            date: p.createdAt ? new Date(p.createdAt) : new Date(),
            method: p.method
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Hola, {session?.user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 mt-2">
                    Aquí tienes un resumen de la actividad de tu negocio este mes.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Pedidos Pendientes"
                    value={pendingOrders.toString()}
                    change="Revisar ahora"
                    intent="alert"
                />
                <StatCard
                    title="En Producción"
                    value={inProductionOrders.toString()}
                    change="Progreso actual"
                    intent="neutral"
                />
                <StatCard
                    title="Ingresos del Mes"
                    value={`$${formatCurrency(monthlyRevenue)}`}
                    change="Ventas totales"
                    intent="success"
                />
            </div>

            {/* Recent Activity Section */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={`${activity.type}-${activity.id}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${activity.type === 'ORDER' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-green-500/10 text-green-400'}`}>
                                        {activity.type === 'ORDER' ? <OrderIcon /> : <PaymentIcon />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {activity.type === 'ORDER' ? 'Nuevo pedido de' : 'Pago recibido de'} {activity.user}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activity.date.toLocaleDateString('es-AR')} • {activity.type === 'ORDER' ? (activity as any).status : (activity as any).method}
                                        </p>

                                    </div>
                                </div>
                                <p className={`font-bold ${activity.type === 'ORDER' ? 'text-white' : 'text-green-400'}`}>
                                    {activity.type === 'ORDER' ? '-' : '+'}${formatCurrency(activity.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-white/5 rounded-lg">
                        No hay actividad reciente para mostrar.
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    )
}

function PaymentIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

function StatCard({ title, value, change, intent }: { title: string, value: string, change: string, intent: 'neutral' | 'success' | 'alert' }) {
    const intentColors = {
        neutral: "text-slate-400",
        success: "text-green-400",
        alert: "text-amber-400"
    }

    return (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/20 transition-colors">
            <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white">{value}</div>
            <div className={`text-sm mt-2 ${intentColors[intent]}`}>{change}</div>
        </div>
    )
}

