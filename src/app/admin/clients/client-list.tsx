'use client'

import { useState } from 'react'
import EditClientModal from './edit-client-modal'
import Link from 'next/link'

interface Client {
    id: string
    name: string | null
    email: string
    phone: string | null
    isRetailer: boolean
    surchargePercentage: any // Prisma.Decimal
}

interface ClientListProps {
    clients: (Client & { balance: any })[]
}

export default function ClientList({ clients }: ClientListProps) {
    const [editingClient, setEditingClient] = useState<Client | null>(null)

    return (
        <>
            <div className="lg:col-span-2 space-y-4">
                {clients.map((client) => {
                    const balance = Number(client.balance);
                    const isDebtor = balance > 0;

                    return (
                        <div key={client.id} className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                            <div>
                                <h3 className="font-semibold text-white">
                                    {client.name}
                                    {client.isRetailer && (
                                        <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-wider">
                                            Minorista (+{Number(client.surchargePercentage)}%)
                                        </span>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-400">{client.email}</p>
                                {client.phone && <p className="text-xs text-slate-500 mt-1">{client.phone}</p>}
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Saldo</p>
                                    <p className={`text-xl font-bold ${isDebtor ? 'text-red-500' : 'text-green-500'}`}>
                                        ${balance.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/clients/${client.id}`}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5"
                                        title="Ver Cuenta Corriente"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5 0h.375c.621 0 1.125.504 1.125 1.125V18M16.5 9h3.375c.621 0 1.125.504 1.125 1.125V18M16.5 9h-3.375a1.125 1.125 0 00-1.125 1.125V18M16.5 9V4.5L12 9h4.5z" />
                                        </svg>
                                    </Link>
                                    <button
                                        onClick={() => setEditingClient(client)}
                                        className="opacity-0 group-hover:opacity-100 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5"
                                        title="Editar Cliente"
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {clients.length === 0 && (
                    <div className="text-center py-10 text-slate-500">No hay clientes registrados.</div>
                )}
            </div>

            {editingClient && (
                <EditClientModal
                    client={editingClient}
                    onClose={() => setEditingClient(null)}
                />
            )}
        </>
    )
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
)
