import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ClientList from "./client-list";

export default async function AdminClientsPage() {
    const clientsRaw = await prisma.user.findMany({
        where: { role: 'CLIENT' },
        orderBy: { name: 'asc' }
    });

    const clients = clientsRaw.map(client => ({
        ...client,
        balance: Number(client.balance),
        surchargePercentage: Number(client.surchargePercentage),
        allowedCategories: client.allowedCategories || []
    }));

    // Get all unique categories from products
    const products = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category']
    });
    const availableCategories = products
        .map(p => p.category)
        .filter(Boolean) as string[];

    // ... (rest of the server action stays the same) ...
    async function createClient(formData: FormData) {
        'use server'
        const name = formData.get('name') as string
        const email = formData.get('email') as string || `client-${Date.now()}@local`
        const phone = formData.get('phone') as string
        const initialBalance = parseFloat(formData.get('balance') as string || '0')
        const isRetailer = formData.get('isRetailer') === 'on'
        const surchargePercentage = parseFloat(formData.get('surchargePercentage') as string || '0')

        await prisma.user.create({
            data: {
                name,
                email, // Fake email allowed if not provided, just for internal ID
                password: '123456',
                role: 'CLIENT',
                phone,
                balance: initialBalance,
                isRetailer,
                surchargePercentage
            }
        })
        revalidatePath('/admin/clients')
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Clientes</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Client List (Refactored to client component) */}
                <ClientList clients={clients} availableCategories={availableCategories} />

                {/* Create Client Form (Stays mostly the same) */}
                <div className="bg-slate-950 border border-white/5 p-6 rounded-xl h-fit sticky top-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Nuevo Cliente</h2>
                    <form action={createClient} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nombre Completo</label>
                            <input name="name" type="text" placeholder="Juan Perez" title="Nombre del cliente" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" required />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email <span className="text-xs text-slate-600">(Opcional)</span></label>
                            <input name="email" type="email" placeholder="cliente@email.com" title="Email del cliente" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                            <input name="phone" type="text" placeholder="11 2233-4455" title="Teléfono del cliente" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Saldo Inicial ($)</label>
                            <input name="balance" type="number" step="0.01" defaultValue="0" placeholder="0.00" title="Saldo inicial" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                            <p className="text-xs text-slate-500 mt-1">Positivo = Debe, Negativo = A favor</p>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    name="isRetailer"
                                    type="checkbox"
                                    className="w-4 h-4 bg-slate-900 border-white/10 rounded accent-indigo-600"
                                />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">¿Es Minorista?</span>
                            </label>

                            <div className="flex items-center gap-2 ml-auto">
                                <label className="text-sm text-slate-400 font-medium">% Recargo</label>
                                <input
                                    name="surchargePercentage"
                                    type="number"
                                    defaultValue="0"
                                    title="Porcentaje de recargo"
                                    className="w-20 bg-slate-900 border border-white/10 rounded px-2 py-1 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-colors">
                            Crear Cliente
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
