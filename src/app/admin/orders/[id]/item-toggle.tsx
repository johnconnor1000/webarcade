'use client'

import { useTransition } from 'react'
import { toggleOrderItemStatus } from '@/app/actions/order-actions'

interface OrderItemToggleProps {
    itemId: string
    isReady: boolean
}

export default function OrderItemToggle({ itemId, isReady }: OrderItemToggleProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            await toggleOrderItemStatus(itemId, !isReady)
        })
    }

    return (
        <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isReady}
                    onChange={handleToggle}
                    disabled={isPending}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {isReady ? 'Listo' : 'Pendiente'}
                </span>
            </label>
            {isPending && <span className="text-xs text-gray-500">Updating...</span>}
        </div>
    )
}
