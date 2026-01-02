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
                <input
                    type="number"
                    min="1"
                    max={remaining}
                    value={amountToDeliver}
                    title="Cantidad a entregar"
                    onChange={(e) => setAmountToDeliver(parseInt(e.target.value) || 0)}
                    className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                    disabled={isPending}
                />
                <button
                    onClick={handleDeliver}
                    disabled={isPending || amountToDeliver <= 0 || amountToDeliver > remaining}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
                >
                    {isPending ? '...' : 'Entregar'}
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
