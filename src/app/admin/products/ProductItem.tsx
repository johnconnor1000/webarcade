'use client'

import { useState } from 'react'
import EditProductModal from './EditProductModal'
import { deleteProduct } from './actions'

interface Variant {
    id: string
    name: string
    price: any // Decimal
}

interface Product {
    id: string
    name: string
    category: string | null
    subcategory: string | null
    ledSurcharge: any // Prisma.Decimal
    variants: Variant[]
}

export default function ProductItem({ product }: { product: Product }) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const prices = product.variants.map(v => Number(v.price))
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceDisplay = prices.length > 0
        ? (minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`)
        : "Sin precio"

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return

        const formData = new FormData()
        formData.append('id', product.id)

        setIsDeleting(true)
        const result = await deleteProduct(formData)
        setIsDeleting(false)

        if (!result.success) {
            alert(result.error)
        }
    }

    return (
        <>
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                <div>
                    <h3 className="font-semibold text-white">{product.name}</h3>
                    <p className="text-sm text-slate-400">
                        {product.category} {product.subcategory && `> ${product.subcategory}`}
                    </p>
                    <div className="mt-2 text-xs text-slate-400">
                        {product.variants.length} variantes
                    </div>
                    <p className="text-lg font-bold text-green-400">{priceDisplay}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5 opacity-0 group-hover:opacity-100"
                        title="Editar Producto"
                    >
                        <EditIcon />
                    </button>
                    <form onSubmit={handleDelete}>
                        <button
                            type="submit"
                            disabled={isDeleting}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all border border-red-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Eliminar Producto"
                        >
                            <TrashIcon />
                        </button>
                    </form>
                </div>
            </div>

            {isEditing && (
                <EditProductModal
                    product={product}
                    onClose={() => setIsEditing(false)}
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

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.791m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
)
