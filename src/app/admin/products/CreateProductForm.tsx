'use client'

import { useState } from 'react'
import { createProduct } from './actions'

export default function CreateProductForm() {
    const [variants, setVariants] = useState([{ name: 'Estándar', imageUrl: '' }])

    const addVariant = () => {
        setVariants([...variants, { name: '', imageUrl: '' }])
    }


    const removeVariant = (index: number) => {
        if (variants.length === 1) return
        setVariants(variants.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: 'name' | 'imageUrl', value: string) => {
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
                    <input name="name" type="text" placeholder="Ej. Arcade Clásico" title="Nombre del producto" className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white" required />
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1 font-medium text-green-400">Precio Base ($)</label>
                        <input name="basePrice" type="number" step="0.01" placeholder="Ej. 1500" className="w-full bg-slate-900 border border-green-500/20 rounded px-3 py-2 text-white focus:border-green-500 transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1 font-medium text-indigo-400">Recargo LED ($)</label>
                        <input name="ledSurcharge" type="number" step="0.01" defaultValue="0" className="w-full bg-slate-900 border border-indigo-500/20 rounded px-3 py-2 text-white focus:border-indigo-500 transition-colors" />
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
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        name={`variant_name_${i}`}
                                        value={v.name}
                                        onChange={(e) => updateVariant(i, 'name', e.target.value)}
                                        placeholder="Nombre (ej. XL)"
                                        className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name={`variant_image_${i}`}
                                        value={v.imageUrl}
                                        onChange={(e) => updateVariant(i, 'imageUrl', e.target.value)}
                                        placeholder="URL Imagen (opcional)"
                                        className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1 text-[10px] text-slate-400 focus:text-white transition-colors"
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
