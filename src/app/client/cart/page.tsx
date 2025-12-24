'use client';

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Carrito de Compras
                </h1>

                <div className="text-center py-20">
                    <div className="text-slate-500 mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-24 h-24 mx-auto mb-4 opacity-50"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h2>
                    <p className="text-slate-400 mb-6">Agrega productos desde el catálogo para comenzar tu pedido</p>
                    <Link
                        href="/client/catalog"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                        </svg>
                        Ver Catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Carrito de Compras
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {getTotalItems()} producto{getTotalItems() !== 1 ? 's' : ''} en tu carrito
                    </p>
                </div>
                <Link
                    href="/client/catalog"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    ← Seguir comprando
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div
                            key={`${item.variantId}-${item.buttonsType}`}
                            className="bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Product Info */}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white text-lg mb-1">
                                        {item.productName}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-1">
                                        Variante: {item.variantName}
                                    </p>
                                    <div className="mb-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border border-white/10 uppercase font-bold tracking-tighter ${item.buttonsType === 'LED' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                            Botones {item.buttonsType === 'LED' ? 'LED' : 'Comunes'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        ${item.price.toFixed(2)} c/u
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updateQuantity(item.variantId, item.buttonsType, item.quantity - 1)}
                                        className="w-8 h-8 bg-slate-950 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center justify-center"
                                    >
                                        −
                                    </button>
                                    <span className="text-white font-medium w-8 text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.variantId, item.buttonsType, item.quantity + 1)}
                                        className="w-8 h-8 bg-slate-950 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Subtotal and Remove */}
                                <div className="text-right">
                                    <p className="text-xl font-bold text-white mb-2">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.variantId, item.buttonsType)}
                                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Eliminar
                                    </button>

                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-950 border border-white/5 rounded-xl p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Resumen del Pedido
                        </h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal ({getTotalItems()} items)</span>
                                <span>${getTotalPrice().toFixed(2)}</span>
                            </div>
                            <div className="border-t border-white/5 pt-3">
                                <div className="flex justify-between text-white text-xl font-bold">
                                    <span>Total</span>
                                    <span>${getTotalPrice().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/client/checkout')}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors mb-3"
                        >
                            Proceder al Checkout
                        </button>

                        <p className="text-xs text-slate-500 text-center">
                            El pedido se agregará a tu cuenta y podrás ver el estado en "Mis Pedidos"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
