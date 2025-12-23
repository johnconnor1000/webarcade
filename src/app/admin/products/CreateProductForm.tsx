'use client'

import { useState } from 'react'
import { createProduct } from './actions'

export default function CreateProductForm() {
    const [variants, setVariants] = useState([{ name: 'Estándar', price: '' }])

    const addVariant = () => {
        setVariants([...variants, { name: '', price: '' }])
    }

    const removeVariant = (index: number) => {
        if (variants.length === 1) return
        setVariants(variants.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: 'name' | 'price', value: string) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    return (
        <div className="bg-slate-950 border border-white/5 p-6 rounded-xl h-fit sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">Nuevo Producto</h2>
            <form action={createProduct} className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                    <input name="name" type="text" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Familia</label>
                        <input name="category" type="text" placeholder="Ej. Mesas" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Subgrupo</label>
                        <input name="subcategory" type="text" placeholder="Ej. Ratonas" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" />
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">Variantes</label>
                        <button type="button" onClick={addVariant} className="text-xs text-indigo-400 hover:text-indigo-300">
                            + Agregar Variante
                        </button>
                    </div>

                    <div className="space-y-3">
                        {variants.map((v, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name={`variant_name_${i}`}
                                        value={v.name}
                                        onChange={(e) => updateVariant(i, 'name', e.target.value)}
                                        placeholder="Nombre (ej. XL)"
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <input
                                        type="number"
                                        step="0.01"
                                        name={`variant_price_${i}`}
                                        value={v.price}
                                        onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                        placeholder="Precio"
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                        required
                                    />
                                </div>
                                {variants.length > 1 && (
                                    <button type="button" onClick={() => removeVariant(i)} className="text-slate-500 hover:text-red-400 pt-1">
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-colors">
                    Crear Producto
                </button>
            </form>
        </div>
    )
}
