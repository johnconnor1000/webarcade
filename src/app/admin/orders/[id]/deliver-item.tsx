'use client'

import { useState, useTransition } from 'react'
import { registerDelivery } from '../actions'

interface DeliverItemProps {
    orderId: string
    itemId: string
    productName: string
    variantName: string
    orderedQuantity: number
    deliveredQuantity: number
}

export default function DeliverItem({
    orderId,
    itemId,
    productName,
    variantName,
    orderedQuantity,
    deliveredQuantity
}: DeliverItemProps) {
    const [amountToDeliver, setAmountToDeliver] = useState(orderedQuantity - deliveredQuantity)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const remaining = orderedQuantity - deliveredQuantity

    const handleDeliver = () => {
        if (amountToDeliver <= 0 || amountToDeliver > remaining) {
            setMessage({ type: 'error', text: 'Cantidad inválida' })
            return
        }

        startTransition(async () => {
            const result = await registerDelivery(orderId, [
                { itemId, quantityToDeliver: amountToDeliver }
            ])

            if ('success' in result && result.success) {
                setMessage({ type: 'success', text: 'Entrega registrada' })
                setAmountToDeliver(remaining - amountToDeliver)
            } else if ('error' in result) {
                setMessage({ type: 'error', text: result.error || 'Error' })
            }
        })
    }

    if (remaining <= 0) {
        return <span className="text-green-500 font-medium">Entregado</span>
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex flex-col">
                    <label className="text-[9px] text-slate-500 uppercase font-bold text-left ml-1">Cant.</label>
                    <input
                        type="number"
                        min="1"
                        max={remaining}
                        value={amountToDeliver}
                        title="Cantidad a entregar"
                        onChange={(e) => setAmountToDeliver(parseInt(e.target.value) || 0)}
                        className="w-16 bg-slate-950 border border-slate-700/50 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        disabled={isPending}
                    />
                </div>
                <button
                    onClick={handleDeliver}
                    disabled={isPending || amountToDeliver <= 0 || amountToDeliver > remaining}
                    className="mt-4 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-green-900/20 disabled:opacity-30 flex items-center gap-1"
                >
                    {isPending ? (
                        <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Entregar</span>
                        </>
                    )}
                </button>
            </div>
            {message && (
                <p className={`text-[10px] ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message.text}
                </p>
            )}
        </div>
    )
}
