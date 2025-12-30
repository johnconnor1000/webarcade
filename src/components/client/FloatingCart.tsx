'use client';

import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function FloatingCart() {
    const { items, getTotalPrice, getTotalItems } = useCart();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(items.length > 0);
    }, [items.length]);

    if (!isVisible && items.length === 0) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-500 transform ${items.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="container mx-auto max-w-4xl">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-tight">
                                {getTotalItems()} {getTotalItems() === 1 ? 'Producto' : 'Productos'}
                            </p>
                            <p className="text-indigo-400 font-bold text-xl">
                                Total: ${formatCurrency(getTotalPrice())}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/client/cart')}
                            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium hidden sm:block"
                        >
                            Ver Carrito
                        </button>
                        <button
                            onClick={() => router.push('/client/checkout')}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/40"
                        >
                            <span>Finalizar Pedido</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
