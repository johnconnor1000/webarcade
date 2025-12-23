'use client';

import { useState } from 'react';
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { createOrder } from "../actions";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, getTotalPrice, getTotalItems, clearCart } = useCart();
    const router = useRouter();
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (items.length === 0) {
        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Checkout
                </h1>

                <div className="text-center py-20">
                    <p className="text-slate-400 mb-6">No hay productos en el carrito</p>
                    <Link
                        href="/client/catalog"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Ver Catálogo
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const result = await createOrder(items, notes || undefined);

            if (result.success) {
                clearCart();
                router.push(`/client/orders?success=true&orderId=${result.orderId}`);
            } else {
                setError(result.error || 'Error al crear el pedido');
            }
        } catch (err) {
            setError('Error inesperado. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    Confirmar Pedido
                </h1>
                <p className="text-slate-400 mt-2">
                    Revisa tu pedido antes de confirmar
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items List */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Productos ({getTotalItems()})
                            </h2>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.variantId}
                                        className="flex items-start justify-between py-3 border-b border-white/5 last:border-0"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium text-white">
                                                {item.productName}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {item.variantName} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                ${item.price.toFixed(2)} c/u
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Notas del Pedido (Opcional)
                            </h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Agrega cualquier comentario o instrucción especial para tu pedido..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                maxLength={500}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                {notes.length}/500 caracteres
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-950 border border-white/5 rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-white mb-6">
                                Resumen
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>${getTotalPrice().toFixed(2)}</span>
                                </div>
                                <div className="border-t border-white/5 pt-3">
                                    <div className="flex justify-between text-white text-2xl font-bold">
                                        <span>Total</span>
                                        <span>${getTotalPrice().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mb-3 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Confirmar Pedido
                                    </>
                                )}
                            </button>

                            <Link
                                href="/client/cart"
                                className="block text-center text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                ← Volver al carrito
                            </Link>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Al confirmar, el pedido se agregará a tu cuenta y el monto total se sumará a tu saldo. Podrás ver el estado del pedido en "Mis Pedidos".
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
