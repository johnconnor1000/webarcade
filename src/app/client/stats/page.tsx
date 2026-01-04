import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientStatsPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const rawUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });
    if (!rawUser) redirect("/login");

    const { period } = await searchParams;
    const isHistorical = period === 'all';

    const startDate = isHistorical
        ? new Date(0)
        : new Date(new Date().setDate(new Date().getDate() - 30));

    // Fetch order items for this user
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: {
                userId: rawUser.id,
                createdAt: { gte: startDate },
                status: { not: 'CANCELED' }
            }
        },
        include: {
            variant: {
                include: {
                    product: true
                }
            }
        }
    });

    // Aggregate data by variant (not just product)
    const statsByVariant = orderItems.reduce((acc, item) => {
        const product = item.variant?.product;
        const variant = item.variant;

        if (!variant || !product) return acc; // Skip incomplete data

        const key = String(variant.id || 'unknown');

        if (!acc[key]) {
            acc[key] = {
                productName: String(product.name || 'Sin nombre'),
                variantName: String(variant.name || 'Sin variante'),
                displayName: `${String(product.name || 'Sin nombre')} - ${String(variant.name || 'Sin variante')}`,
                units: 0,
                totalSpent: 0,
                category: String(product.category || 'Sin categoría')
            };
        }
        acc[key].units += Number(item.quantity || 0);
        acc[key].totalSpent += Number(item.price || 0) * Number(item.quantity || 0);
        return acc;
    }, {} as Record<string, { productName: string, variantName: string, displayName: string, units: number, totalSpent: number, category: string }>);

    const sortedByUnits = Object.values(statsByVariant).sort((a, b) => b.units - a.units);

    const totalOrders = await prisma.order.count({
        where: {
            userId: rawUser.id,
            createdAt: { gte: startDate },
            status: { not: 'CANCELED' }
        }
    });

    const totalSpent = Object.values(statsByVariant).reduce((sum, p) => sum + p.totalSpent, 0);
    const totalUnits = Object.values(statsByVariant).reduce((sum, p) => sum + p.units, 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Mis Estadísticas
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isHistorical ? 'Resumen de toda tu actividad' : 'Tu actividad en los últimos 30 días'}
                    </p>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 self-start">
                    <Link
                        href="/client/stats"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isHistorical ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Últimos 30 días
                    </Link>
                    <Link
                        href="/client/stats?period=all"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isHistorical ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Histórico
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Mis Pedidos</p>
                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Productos Comprados</p>
                    <p className="text-3xl font-bold text-white">{totalUnits}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Inversión Total</p>
                    <p className="text-3xl font-bold text-indigo-400">${formatCurrency(totalSpent)}</p>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">Mis Productos más Pedidos</h2>
                    <p className="text-xs text-slate-500 mt-1">Los productos que más has solicitado en este período</p>
                </div>
                {sortedByUnits.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Producto / Variante</th>
                                    <th className="px-6 py-3 text-right">Cantidad Total</th>
                                    <th className="px-6 py-3 text-right">Inversión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedByUnits.map((p, idx) => (
                                    <tr key={p.displayName} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${idx < 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{p.productName}</p>
                                                    <p className="text-xs text-indigo-400">{p.variantName}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{p.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-indigo-400">{p.units}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-slate-400">${formatCurrency(p.totalSpent)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500 underline decoration-slate-900">
                        <p className="italic">Aún no hay datos de pedidos para mostrar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
