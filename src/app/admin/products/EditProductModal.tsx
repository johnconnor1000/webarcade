'use client'

import { useState, useTransition } from 'react'
import { updateProduct } from './actions'

interface Variant {
    id?: string
    name: string
    price: string | number
}

interface Product {
    id: string
    name: string
    category: string | null
    subcategory: string | null
    ledSurcharge: any // Prisma.Decimal
    variants: Variant[]
}

interface EditProductModalProps {
    product: Product
    onClose: () => void
}

export default function EditProductModal({ product, onClose }: EditProductModalProps) {
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState(product.name)
    const [category, setCategory] = useState(product.category || '')
    const [subcategory, setSubcategory] = useState(product.subcategory || '')
    const [ledSurcharge, setLedSurcharge] = useState(Number(product.ledSurcharge) || 0)
    const [variants, setVariants] = useState<Variant[]>(product.variants.map(v => ({ ...v, price: Number(v.price) })))
    const [error, setError] = useState<string | null>(null)

    const addVariant = () => {
        setVariants([...variants, { name: '', price: '' }])
    }

    const removeVariant = (index: number) => {
        if (variants.length === 1) return
        setVariants(variants.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], [field]: value }
        setVariants(newVariants)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData()
        formData.append('id', product.id)
        formData.append('name', name)
        formData.append('category', category)
        formData.append('subcategory', subcategory)
        formData.append('ledSurcharge', ledSurcharge.toString())

        variants.forEach((v, i) => {
            if (v.id) formData.append(`variant_id_${i}`, v.id)
            formData.append(`variant_name_${i}`, v.name)
            formData.append(`variant_price_${i}`, v.price.toString())
        })

        startTransition(async () => {
            try {
                await updateProduct(formData)
                onClose()
            } catch (err) {
                setError("Ocurrió un error al guardar el producto.")
            }
        })
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Editar Producto</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                type="text"
                                placeholder="Nombre del producto"
                                title="Nombre del producto"
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Familia</label>
                                <input
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    type="text"
                                    placeholder="Ej: Remeras"
                                    title="Familia o categoría"
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Subgrupo</label>
                                <input
                                    value={subcategory}
                                    onChange={e => setSubcategory(e.target.value)}
                                    type="text"
                                    placeholder="Ej: Algodón"
                                    title="Subgrupo o subcategoría"
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-1 font-medium">Recargo Botones LED ($)</label>
                            <input
                                value={ledSurcharge}
                                onChange={e => setLedSurcharge(parseFloat(e.target.value) || 0)}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                title="Recargo por botones LED"
                                className="w-full bg-slate-950 border border-indigo-500/20 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-400">Variantes</label>
                            <button type="button" onClick={addVariant} className="text-xs text-indigo-400 hover:text-indigo-300">
                                + Agregar Variante
                            </button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {variants.map((v, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                    <input
                                        value={v.name}
                                        onChange={e => updateVariant(i, 'name', e.target.value)}
                                        placeholder="Nombre"
                                        title="Nombre de la variante"
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                    <input
                                        value={v.price}
                                        onChange={e => updateVariant(i, 'price', e.target.value)}
                                        type="number"
                                        step="0.01"
                                        placeholder="Precio"
                                        className="w-24 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                                        required
                                    />
                                    {variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(i)}
                                            className="p-2 text-slate-500 hover:text-red-400"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            {isPending ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
