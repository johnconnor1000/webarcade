'use client'

import { useState, useTransition } from 'react'
import { updateClient, resetClientPassword } from '@/app/actions/client-actions'

interface Client {
    id: string
    name: string | null
    email: string
    phone: string | null
    isRetailer: boolean
    surchargePercentage: any // Prisma.Decimal
    allowedCategories: string[]
}

interface EditClientModalProps {
    client: Client
    onClose: () => void
    availableCategories: string[]
}

export default function EditClientModal({ client, onClose, availableCategories }: EditClientModalProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        isRetailer: client.isRetailer || false,
        surchargePercentage: Number(client.surchargePercentage) || 0,
        allowedCategories: client.allowedCategories || []
    })
    const [newPassword, setNewPassword] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)
        startTransition(async () => {
            const result = await updateClient(client.id, formData)
            if (result.success) {
                setMessage({ type: 'success', text: 'Datos actualizados correctamente.' })
                setTimeout(onClose, 1500)
            } else {
                setMessage({ type: 'error', text: result.error || 'Error al actualizar los datos.' })
            }
        })
    }

    const handleResetPassword = () => {
        if (!newPassword) return
        setMessage(null)
        startTransition(async () => {
            const result = await resetClientPassword(client.id, newPassword)
            if (result.success) {
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' })
                setNewPassword('')
            } else {
                setMessage({ type: 'error', text: 'Error al actualizar la contraseña.' })
            }
        })
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Editar Cliente</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Nombre Completo</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            type="text"
                            placeholder="Juan Perez"
                            title="Nombre del cliente"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            type="email"
                            placeholder="cliente@email.com"
                            title="Email del cliente"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                        <input
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            type="text"
                            placeholder="11 2233-4455"
                            title="Teléfono del cliente"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.isRetailer}
                                onChange={e => setFormData({ ...formData, isRetailer: e.target.checked })}
                                className="w-4 h-4 bg-slate-950 border-white/10 rounded accent-indigo-600"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">¿Es Minorista?</span>
                        </label>

                        {formData.isRetailer && (
                            <div className="flex items-center gap-2 ml-auto">
                                <label className="text-sm text-slate-400 font-medium">% Recargo</label>
                                <input
                                    type="number"
                                    value={formData.surchargePercentage}
                                    onChange={e => setFormData({ ...formData, surchargePercentage: Number(e.target.value) })}
                                    placeholder="0"
                                    title="Porcentaje de recargo"
                                    className="w-20 bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* Category Access Control */}
                    {availableCategories.length > 0 && (
                        <div className="pt-4 border-t border-white/5">
                            <label className="block text-sm text-slate-400 mb-3">
                                Categorías Permitidas
                                <span className="text-xs text-slate-500 ml-2">(vacío = todas)</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableCategories.map((category) => (
                                    <label key={category} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowedCategories.includes(category)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        allowedCategories: [...formData.allowedCategories, category]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        allowedCategories: formData.allowedCategories.filter(c => c !== category)
                                                    });
                                                }
                                            }}
                                            className="w-4 h-4 bg-slate-950 border-white/10 rounded accent-indigo-600"
                                        />
                                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                            {category}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors"
                    >
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Reiniciar Contraseña</h3>
                    <div className="flex gap-2">
                        <input
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            type="text"
                            placeholder="Nueva contraseña"
                            title="Nueva contraseña para el cliente"
                            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors text-sm"
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={isPending || !newPassword}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors border border-white/5"
                        >
                            Cambiar
                        </button>
                    </div>
                </div>

                {message && (
                    <p className={`mt-4 text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    )
}
