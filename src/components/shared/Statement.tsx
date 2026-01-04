'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface Transaction {
    id: string
    date: Date | string
    type: 'ORDER' | 'PAYMENT'
    amount: number
    description: string
    status?: string
}

interface StatementProps {
    userName: string
    currentBalance: number
    transactions: Transaction[]
}

export default function Statement({ userName, currentBalance, transactions }: StatementProps) {
    const isDebtor = currentBalance > 0

    return (
        <div className="space-y-6">
            {/* Balance Header */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Saldo al día de hoy</h2>
                        <div className={`text-4xl font-black mt-1 ${isDebtor ? 'text-red-500' : 'text-green-500'}`}>
                            ${formatCurrency(currentBalance)}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            Cliente: <span className="text-white font-medium">{userName}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl border ${isDebtor ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'} text-sm font-bold uppercase tracking-tight`}>
                            {isDebtor ? 'Cuenta con Deuda' : 'Saldo a Favor / Al Día'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-white/5 bg-slate-900/30">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Historial de Movimientos</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-white/5 bg-slate-950/20">
                                <th className="px-6 py-3 font-semibold">Fecha</th>
                                <th className="px-6 py-3 font-semibold">Concepto / Detalle</th>
                                <th className="px-6 py-3 font-semibold text-right">Debe (Pedido)</th>
                                <th className="px-6 py-3 font-semibold text-right">Haber (Pago)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 uppercase">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">
                                                {new Date(tx.date).toLocaleDateString('es-AR')}
                                            </span>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(tx.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tx.type === 'ORDER' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                                                {tx.type === 'ORDER' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.546 1.16 3.743 1.16 5.289 0m-5.289-8l.879.659c1.546 1.16 3.743 1.16 5.289 0m-5.289 8.002c-1.546 1.16-3.743 1.16-5.289 0m0-11.204c1.546-1.16 3.743-1.16 5.289 0m-5.289 11.204V3.75m0 16.5v-1.118" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white tracking-wide">
                                                    {tx.description}
                                                </p>
                                                {tx.status && (
                                                    <StatusBadge status={tx.status} />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.type === 'ORDER' ? (
                                            <span className="text-sm font-bold text-white">
                                                ${formatCurrency(tx.amount)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.type === 'PAYMENT' ? (
                                            <span className="text-sm font-bold text-green-500">
                                                ${formatCurrency(tx.amount)}
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic lowercase">
                                        no se registran movimientos en esta cuenta.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'PTE', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        CONFIRMED: { label: 'CONF', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        IN_PRODUCTION: { label: 'PROD', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
        READY: { label: 'LISTO', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
        DELIVERED: { label: 'ENTREG', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
        CANCELED: { label: 'CANC', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    }

    const config = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' }

    return (
        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold ${config.color} mt-1 inline-block`}>
            {config.label}
        </span>
    )
}
