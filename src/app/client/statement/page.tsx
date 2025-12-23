import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Statement from "@/components/shared/Statement";

export default async function ClientStatementPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
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

    if (!user) {
        redirect("/login");
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
