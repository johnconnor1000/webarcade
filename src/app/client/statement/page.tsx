import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Statement from "@/components/shared/Statement";

export const dynamic = "force-dynamic";

export default async function ClientStatementPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const rawUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
            },
            payments: {
                orderBy: { createdAt: 'desc' },
            }
        }
    });

    if (!rawUser) {
        redirect("/login");
    }

    // Combine transactions into safe DTOs
    const orderTransactions = rawUser.orders.map(order => ({
        id: String(order.id || ''),
        date: order.createdAt instanceof Date ? order.createdAt.toISOString() : new Date().toISOString(),
        type: 'ORDER' as const,
        amount: Number(order.total || 0),
        description: `Pedido #${String(order.id || '').slice(0, 8)}`,
        status: String(order.status || 'PENDING')
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
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Cuenta Corriente</h1>
                <p className="text-slate-400 mt-2">Detalle cronológico de tus pedidos y pagos realizados.</p>
            </div>

            <Statement
                userName={user.name || user.email}
                currentBalance={Number(user.balance)}
                transactions={allTransactions}
            />
        </div>
    );
}
