import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Statement from "@/components/shared/Statement";
import Link from "next/link";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
            },
            payments: {
                orderBy: { createdAt: 'desc' },
            }
        }
    });

    if (!user || user.role !== 'CLIENT') {
        notFound();
    }

    // Combine transactions
    const orderTransactions = user.orders.map(order => ({
        id: order.id,
        date: order.createdAt,
        type: 'ORDER' as const,
        amount: Number(order.total),
        description: `Pedido #${order.id.slice(0, 8)}`,
        status: order.status
    }));

    const paymentTransactions = user.payments.map(payment => ({
        id: payment.id,
        date: payment.createdAt,
        type: 'PAYMENT' as const,
        amount: Number(payment.amount),
        description: `Pago registrado (${payment.method})`,
    }));

    const allTransactions = [...orderTransactions, ...paymentTransactions].sort((a, b) =>
        b.date.getTime() - a.date.getTime()
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/clients"
                    className="p-2 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Detalle de Cliente</h1>
                    <p className="text-slate-400 mt-1">Información detallada y cuenta corriente de {user.name}.</p>
                </div>
            </div>

            <Statement
                userName={user.name || user.email}
                currentBalance={Number(user.balance)}
                transactions={allTransactions}
            />
        </div>
    );
}
