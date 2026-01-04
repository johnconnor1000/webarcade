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

    const paymentTransactions = rawUser.payments.map((payment: any) => ({
        id: String(payment.id || ''),
        date: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
        type: 'PAYMENT' as const,
        amount: Number(payment.amount || 0),
        description: `Pago registrado (${String(payment.method || 'OTROS')})`,
    }));

    const user = {
        name: String(rawUser.name || rawUser.email || 'Cliente'),
        balance: Number(rawUser.balance || 0)
    };

    const allTransactions = [...orderTransactions, ...paymentTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Cuenta Corriente</h1>
                <p className="text-slate-400 mt-2">Detalle cronológico de tus pedidos y pagos realizados.</p>
            </div>

            <Statement
                userName={user.name}
                currentBalance={user.balance}
                transactions={allTransactions}
            />
        </div>
    );
}
