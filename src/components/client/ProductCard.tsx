'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

interface ProductCardProps {
    product: {
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
            imageUrl?: string | null;
            price?: number;
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
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const selectedVariant = product.variants.find(v => v.id === selectedVariantId);

    // Determine which image to show: variant image or product image
    const currentImageUrl = selectedVariant?.imageUrl || product.imageUrl || null;

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        addItem(
            {
                variantId: selectedVariant.id,
                productName: product.name,
                variantName: selectedVariant.name,
                price: Number(product.basePrice),
                buttonsType,
                ledSurcharge: buttonsType === 'LED' ? Number(product.ledSurcharge) : 0,
            },
            quantity
        );

        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
        setQuantity(1);
    };

    return (
        <>
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden group">
                {/* Notification */}
                {showNotification && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg z-20 animate-bounce">
                        ✓ Agregado
                    </div>
                )}

                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="lg:w-48 h-48 lg:h-auto bg-slate-950/50 relative overflow-hidden flex-shrink-0 cursor-zoom-in" onClick={() => currentImageUrl && setIsLightboxOpen(true)}>
                        {currentImageUrl ? (
                            <Image
                                src={currentImageUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-20">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                            <span className="text-[10px] text-white font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                                </svg>
                                Expandir
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5 flex flex-col justify-between gap-6 min-w-0">
                        {/* Header Info */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-xl font-bold text-white tracking-tight leading-tight">
                                    {product.name}
                                </h3>
                            </div>
                            {(product.category || product.subcategory) && (
                                <div className="flex gap-2 flex-wrap text-[10px] font-bold uppercase tracking-wider">
                                    {product.category && (
                                        <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                                            {product.category}
                                        </span>
                                    )}
                                    {product.subcategory && (
                                        <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
                                            {product.subcategory}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            {/* Variant Selector */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Variante</label>
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                    title="Seleccionar Variante"
                                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer hover:border-white/20"
                                >
                                    {product.variants.map((variant) => (
                                        <option key={variant.id} value={variant.id}>
                                            {variant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Tecnología</label>
                                <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 h-[42px]">
                                    <button
                                        onClick={() => setButtonsType('COMMON')}
                                        className={`flex-1 text-xs font-bold rounded-lg transition-all ${buttonsType === 'COMMON' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Común
                                    </button>
                                    <button
                                        onClick={() => setButtonsType('LED')}
                                        className={`flex-1 text-xs font-bold rounded-lg transition-all ${buttonsType === 'LED' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        LED
                                    </button>
                                </div>
                            </div>

                            {/* Quantity & Action */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest pl-1">Cantidad</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 h-[42px]">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            title="Menos"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                            </svg>
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            title="Cantidad"
                                            className="w-8 bg-transparent border-none text-white text-center font-bold text-sm focus:outline-none focus:ring-0"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                            title="Más"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!selectedVariant}
                                        className="flex-1 bg-white text-slate-950 h-[42px] px-4 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-indigo-500 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Total Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Precio Final</span>
                                <span className="text-2xl font-black text-white flex items-baseline gap-1">
                                    <span className="text-sm font-medium text-slate-500">$</span>
                                    {selectedVariant ? formatCurrency((Number(product.basePrice) + (buttonsType === 'LED' ? Number(product.ledSurcharge || 0) : 0)) * quantity) : '0,00'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && currentImageUrl && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        title="Cerrar vista previa"
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative w-full h-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 ring-1 ring-white/20">
                        <Image
                            src={currentImageUrl}
                            alt={product.name}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            )}
        </>
    );
}
