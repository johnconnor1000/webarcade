'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        category: string | null;
        subcategory: string | null;
        variants: Array<{
            id: string;
            name: string;
            price: number;
        }>;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [selectedVariantId, setSelectedVariantId] = useState(
        product.variants[0]?.id || ''
    );
    const [quantity, setQuantity] = useState(1);
    const [buttonsType, setButtonsType] = useState<'COMMON' | 'LED'>('COMMON');
    const [showNotification, setShowNotification] = useState(false);

    const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addItem(
            {
                variantId: selectedVariant.id,
                productName: product.name,
                variantName: selectedVariant.name,
                price: Number(selectedVariant.price),
                buttonsType,
                ledSurcharge: buttonsType === 'LED' ? Number((product as any).ledSurcharge) : 0,
            },
            quantity
        );


        // Show notification
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);

        // Reset quantity
        setQuantity(1);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-lg hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10 relative">
            {/* Notification */}
            {showNotification && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-10 animate-fade-in">
                    ✓ Agregado
                </div>
            )}

            {/* Responsive Layout */}
            <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-0.5 md:truncate">
                        {product.name}
                    </h3>
                    {(product.category || product.subcategory) && (
                        <div className="flex gap-1.5 flex-wrap">
                            {product.category && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/10">
                                    {product.category}
                                </span>
                            )}
                            {product.subcategory && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/10">
                                    {product.subcategory}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6">
                    {/* Variant Selector */}
                    {product.variants.length > 0 && (
                        <div className="w-full sm:w-64">
                            <select
                                value={selectedVariantId}
                                onChange={(e) => setSelectedVariantId(e.target.value)}
                                title="Seleccionar Variante"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {product.variants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                        {variant.name} - ${Number(variant.price).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                        {/* Buttons Type Selector */}
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Botones</label>
                            <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/10">
                                <button
                                    onClick={() => setButtonsType('COMMON')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${buttonsType === 'COMMON' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Común
                                </button>
                                <button
                                    onClick={() => setButtonsType('LED')}
                                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${buttonsType === 'LED' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                                >
                                    LED
                                </button>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cantidad</label>
                            <div className="flex items-center gap-1 bg-slate-950/30 p-1 rounded-xl border border-white/5 h-[38px]">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center bg-slate-950/50 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                                    title="Menos"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                    </svg>
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    title="Cantidad"
                                    className="w-10 bg-transparent border-none text-white text-center font-bold text-sm focus:outline-none focus:ring-0"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-slate-950/50 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                                    title="Más"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex flex-col items-end min-w-[100px]">
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Total</span>
                            <span className="text-xl font-black text-white">
                                ${selectedVariant ? ((Number(selectedVariant.price) + (buttonsType === 'LED' ? Number((product as any).ledSurcharge || 0) : 0)) * quantity).toFixed(2) : '0.00'}
                            </span>
                        </div>


                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:bg-slate-700 disabled:opacity-50 disabled:scale-100 text-white font-bold p-3 sm:px-6 sm:py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                            title="Agregar al Carrito"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                            <span className="hidden sm:inline">Agregar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
