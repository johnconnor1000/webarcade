import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function AdminStatsPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const { period } = await searchParams;
    const isHistorical = period === 'all';

    const startDate = isHistorical
        ? new Date(0)
        : new Date(new Date().setDate(new Date().getDate() - 30));

    // Fetch order items within period
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: {
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

        const key = variant.id;

        if (!acc[key]) {
            acc[key] = {
                productName: product.name || 'Sin nombre',
                variantName: variant.name || 'Sin variante',
                displayName: `${product.name || 'Sin nombre'} - ${variant.name || 'Sin variante'}`,
                units: 0,
                revenue: 0,
                category: product.category || 'Sin categoría'
            };
        }
        acc[key].units += item.quantity || 0;
        acc[key].revenue += Number(item.price || 0) * (item.quantity || 0);
        return acc;
    }, {} as Record<string, { productName: string, variantName: string, displayName: string, units: number, revenue: number, category: string }>);

    const sortedByUnits = Object.values(statsByVariant).sort((a, b) => b.units - a.units);
    const sortedByRevenue = Object.values(statsByVariant).sort((a, b) => b.revenue - a.revenue);

    const totalOrders = await prisma.order.count({
        where: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELED' }
        }
    });

    const totalRevenue = Object.values(statsByVariant).reduce((sum, p) => sum + p.revenue, 0);
    const totalUnits = Object.values(statsByVariant).reduce((sum, p) => sum + p.units, 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Estadísticas de Ventas
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {isHistorical ? 'Rendimiento histórico total' : 'Resumen de los últimos 30 días'}
                    </p>
                </div>

                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 self-start">
                    <Link
                        href="/admin/stats"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isHistorical ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Últimos 30 días
                    </Link>
                    <Link
                        href="/admin/stats?period=all"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isHistorical ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        Histórico
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Pedidos</p>
                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Unidades Vendidas</p>
                    <p className="text-3xl font-bold text-white">{totalUnits}</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm font-medium text-slate-500 mb-1">Ingresos Totales</p>
                    <p className="text-3xl font-bold text-green-400">${formatCurrency(totalRevenue)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Top Selling By Units */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">Productos más vendidos (Unidades)</h2>
                        <p className="text-xs text-slate-500 mt-1">Ordenado por volumen de unidades vendidas</p>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[500px]">
                        {sortedByUnits.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Producto / Variante</th>
                                        <th className="px-6 py-3 text-right">Cant.</th>
                                        <th className="px-6 py-3 text-right">Recaudación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedByUnits.map((p, idx) => (
                                        <tr key={p.displayName} className="hover:bg-white/[0.02] transition-colors group">
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
                                                <span className="text-sm text-slate-400">${formatCurrency(p.revenue)}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <NoData />
                        )}
                    </div>
                </div>

                {/* Top By Revenue */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-lg font-semibold text-white">Líderes de Ingresos</h2>
                        <p className="text-xs text-slate-500 mt-1">Los productos que generaron más dinero</p>
                    </div>
                    <div className="flex-1 overflow-auto max-h-[500px]">
                        {sortedByRevenue.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3">Producto / Variante</th>
                                        <th className="px-6 py-3 text-right">Ingresos</th>
                                        <th className="px-6 py-3 text-right">Participación</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedByRevenue.map((p, idx) => (
                                        <tr key={p.displayName} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold ${idx < 3 ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{p.productName}</p>
                                                        <p className="text-xs text-green-400">{p.variantName}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{p.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-green-400">${formatCurrency(p.revenue)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-xs text-slate-300">
                                                        {totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0}%
                                                    </span>
                                                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{ width: `${totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <NoData />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NoData() {
    return (
        <div className="p-12 text-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mx-auto mb-4 opacity-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm italic">No hay datos de ventas para este período.</p>
        </div>
    );
}
