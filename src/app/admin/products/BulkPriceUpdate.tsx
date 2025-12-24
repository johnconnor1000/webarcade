'use client'

import { useState } from 'react'
import { bulkUpdatePrices } from './actions'

export default function BulkPriceUpdate({ categories }: { categories: string[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [percentage, setPercentage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm(`¿Estás seguro de aumentar los precios en un ${percentage}%?`)) return

        setIsPending(true)
        const formData = new FormData()
        formData.append('category', selectedCategory)
        formData.append('percentage', percentage)

        try {
            await bulkUpdatePrices(formData)
            setIsOpen(false)
            setPercentage('')
            alert('Precios actualizados con éxito')
        } catch (error) {
            alert('Error al actualizar precios')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
                Aumento Masivo %
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Aumento Masivo</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Categoría / Familia</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    title="Categoría de productos"
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                >
                                    <option value="ALL">Todas las categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Porcentaje de Aumento (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={percentage}
                                    onChange={(e) => setPercentage(e.target.value)}
                                    placeholder="Ej: 5"
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>

                            <p className="text-xs text-slate-500 italic">
                                * Este cambio solo afecta al precio base de los productos. Los pedidos anteriores no se modificarán.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || !percentage}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors"
                                >
                                    {isPending ? 'Aplicando...' : 'Aplicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
