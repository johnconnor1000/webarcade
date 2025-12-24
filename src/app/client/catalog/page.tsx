'use client';

import { useEffect, useState } from 'react';
import ProductCard from "@/components/client/ProductCard";

interface Product {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: string | null;
    subcategory: string | null;
    basePrice: any;
    ledSurcharge: any;
    variants: Array<{
        id: string;
        name: string;
        price?: number;
    }>;
}

export default function ClientCatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading products:', err);
                setLoading(false);
            });
    }, []);

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400">Cargando productos...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Catálogo de Productos
                </h1>
                <p className="text-slate-400 mt-2">
                    Selecciona productos, elige variantes y agrégalos al carrito para hacer tu pedido.
                </p>
            </div>

            {/* Categories Filter */}
            {categories.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                    <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                        Filtrar por Categoría
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className="px-4 py-2 bg-slate-950 border border-white/10 text-slate-300 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Products List */}
            {products.length > 0 ? (
                <div className="space-y-2">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-slate-500 mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-16 h-16 mx-auto mb-4 opacity-50"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <p className="text-slate-400">No hay productos disponibles en este momento.</p>
                </div>
            )}
        </div>
    );
}
