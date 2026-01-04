import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientPaymentsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const rawUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!rawUser) {
        redirect("/login");
    }

    // Get all payments for this client with defensive mapping
    const rawPayments = await prisma.payment.findMany({
        where: { userId: rawUser.id },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const payments = rawPayments.map(payment => ({
        id: String(payment.id || ''),
        amount: payment.amount ? String(payment.amount) : '0',
        createdAt: payment.createdAt instanceof Date ? payment.createdAt.toISOString() : new Date().toISOString(),
        method: String(payment.method || 'OTROS'),
        type: String(payment.type || 'GENERAL'),
        notes: payment.notes
    }));

    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Mis Pagos
                </h1>
                <p className="text-slate-400 mt-2">
                    Historial completo de todos tus pagos realizados.
                </p>
            </div>

            {/* Total Paid Summary */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">Total Pagado</p>
                        <p className="text-4xl font-bold text-white">
                            ${formatCurrency(totalPaid)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-400 mb-1">Cantidad de Pagos</p>
                        <p className="text-3xl font-bold text-white">
                            {payments.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            {payments.length > 0 ? (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="text-xl font-bold text-white">
                                            ${formatCurrency(Number(payment.amount))}
                                        </p>
                                        <PaymentTypeBadge type={payment.type} />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-400">
                                            <span className="text-slate-500">Fecha:</span>{' '}
                                            {new Date(payment.createdAt).toLocaleDateString('es-AR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            <span className="text-slate-500">Método:</span>{' '}
                                            <span className="capitalize">{payment.method.toLowerCase().replace('_', ' ')}</span>
                                        </p>
                                        {payment.notes && (
                                            <p className="text-sm text-slate-400 mt-2 pt-2 border-t border-white/5">
                                                <span className="text-slate-500">Notas:</span>{' '}
                                                {payment.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-8 h-8 text-green-500"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-slate-500 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-16 h-16 mx-auto mb-4 opacity-50"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                    <p className="text-slate-400">No hay pagos registrados.</p>
                    <p className="text-sm text-slate-500 mt-2">Los pagos que realices aparecerán aquí.</p>
                </div>
            )}
        </div>
    );
}

function PaymentTypeBadge({ type }: { type: string }) {
    const typeConfig: Record<string, { label: string; color: string }> = {
        DEPOSIT: { label: 'Seña', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        PARTIAL: { label: 'Parcial', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        FULL: { label: 'Total', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    };

    const config = typeConfig[type] || typeConfig.PARTIAL;

    return (
        <span className={`text-xs px-3 py-1 rounded-full border ${config.color} font-medium uppercase tracking-wider`}>
            {config.label}
        </span>
    );
}
