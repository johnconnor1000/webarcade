import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminPaymentsPage() {
    const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
    const payments = await prisma.payment.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    async function registerPayment(formData: FormData) {
        'use server'
        const userId = formData.get('userId') as string
        const amount = parseFloat(formData.get('amount') as string)
        const method = formData.get('method') as string
        const notes = formData.get('notes') as string

        await prisma.$transaction(async (tx) => {
            // Create Payment Record
            await tx.payment.create({
                data: {
                    userId,
                    amount,
                    method,
                    type: 'GENERAL', // Simple general payment for now
                    notes
                }
            })

            // Decrease User Debt (Balance)
            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: { decrement: amount }
                }
            })
        })

        revalidatePath('/admin/payments')
        revalidatePath('/admin/clients') // Update badges
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Pagos y Cobranzas</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Register Payment Form */}
                <div className="bg-slate-950 border border-white/5 p-6 rounded-xl h-fit">
                    <h2 className="text-lg font-semibold text-white mb-4">Registrar Cobro</h2>
                    <form action={registerPayment} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Cliente</label>
                            <select name="userId" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white">
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Monto ($)</label>
                            <input name="amount" type="number" step="0.01" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Método</label>
                            <select name="method" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white">
                                <option value="CASH">Efectivo</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="OTHER">Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Notas</label>
                            <textarea name="notes" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" rows={2} />
                        </div>

                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-2 rounded transition-colors">
                            Registrar Pago
                        </button>
                    </form>
                </div>

                {/* Payment History */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-white mb-4">Últimos Pagos</h2>
                    {payments.map((payment) => (
                        <div key={payment.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-white">{payment.user.name}</h3>
                                <p className="text-sm text-slate-400">{new Date(payment.createdAt).toLocaleDateString()} via {payment.method}</p>
                                {payment.notes && <p className="text-xs text-slate-500 mt-1">"{payment.notes}"</p>}
                            </div>
                            <div className="text-right">
                                <span className="text-green-500 font-bold text-lg">+${payment.amount.toString()}</span>
                            </div>
                        </div>
                    ))}
                    {payments.length === 0 && (
                        <div className="text-center py-10 text-slate-500">No hay pagos registrados.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
