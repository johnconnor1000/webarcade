'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Variant {
    id: string;
    name: string;
    price: number;
}

interface Product {
    id: string;
    name: string;
    ledSurcharge: any;
    variants: Variant[];
}

export default function OrderForm({ clients, products, createOrderAction }: {
    clients: any[],
    products: Product[],
    createOrderAction: (formData: FormData) => Promise<void>
}) {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState(clients[0]?.id || '');
    const [cart, setCart] = useState<{ variantId: string, quantity: number, price: number, name: string }[]>([]);

    // Product Selection State
    const [currentProductId, setCurrentProductId] = useState(products[0]?.id || '');
    const currentProduct = products.find(p => p.id === currentProductId);

    // Auto-select first variant if available
    const [currentVariantId, setCurrentVariantId] = useState('');

    // Update variant when product changes
    useMemo(() => {
        if (currentProduct && currentProduct.variants.length > 0) {
            setCurrentVariantId(currentProduct.variants[0].id);
        } else {
            setCurrentVariantId('');
        }
    }, [currentProductId, currentProduct]);

    const [currentQty, setCurrentQty] = useState(1);
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const addToCart = () => {
        if (!currentProduct || !currentVariantId) return;
        const variant = currentProduct.variants.find(v => v.id === currentVariantId);
        if (!variant) return;

        const user = clients.find(c => c.id === selectedUser);
        let price = Number(variant.price);
        if (user?.isRetailer && user.surchargePercentage > 0) {
            price = price * (1 + user.surchargePercentage / 100);
        }

        const existing = cart.find(item => item.variantId === currentVariantId);
        if (existing) {
            setCart(cart.map(item => item.variantId === currentVariantId ? { ...item, quantity: item.quantity + currentQty } : item));
        } else {
            setCart([...cart, {
                variantId: variant.id,
                quantity: currentQty,
                price: price,
                name: `${currentProduct.name} - ${variant.name}`
            }]);
        }
        setCurrentQty(1);
    };

    const removeFromCart = (variantId: string) => {
        setCart(cart.filter(item => item.variantId !== variantId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Agrega productos al pedido');

        const formData = new FormData();
        formData.append('userId', selectedUser);
        formData.append('cart', JSON.stringify(cart));

        await createOrderAction(formData);
        router.push('/admin/orders');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl space-y-6">
                <h2 className="text-xl font-bold text-white">1. Configurar Pedido</h2>

                {/* Client Selector */}
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Cliente</label>
                    <select
                        className="w-full bg-slate-950 border border-white/10 rounded px-3 py-3 text-white"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        title="Seleccionar Cliente"
                    >
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Product Add */}
                <div className="p-4 bg-slate-950 rounded-lg space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Producto</label>
                        <select
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white"
                            value={currentProductId}
                            onChange={(e) => setCurrentProductId(e.target.value)}
                            title="Seleccionar Producto"
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {currentProduct && currentProduct.variants.length > 0 && (
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Variante</label>
                            <select
                                className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white"
                                value={currentVariantId}
                                onChange={(e) => setCurrentVariantId(e.target.value)}
                                title="Seleccionar Variante"
                            >
                                {currentProduct.variants.map(v => (
                                    <option key={v.id} value={v.id}>{v.name} - ${v.price}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-4 items-end">
                        <div className="w-1/3">
                            <label className="block text-sm text-slate-400 mb-2">Cantidad</label>
                            <input
                                type="number" min="1"
                                className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-white"
                                value={currentQty}
                                onChange={(e) => setCurrentQty(parseInt(e.target.value))}
                                title="Cantidad"
                                placeholder="1"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addToCart}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition-colors"
                        >
                            Agregar al Pedido
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl flex flex-col">
                <h2 className="text-xl font-bold text-white mb-6">2. Resumen</h2>

                <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                    {cart.map((item) => (
                        <div key={item.variantId} className="flex justify-between items-center bg-slate-950/50 p-3 rounded border border-white/5">
                            <div>
                                <p className="text-white font-medium">{item.name}</p>
                                <p className="text-sm text-slate-500">{item.quantity} x ${item.price}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-white font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.variantId)} className="text-red-500 hover:text-red-400">×</button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <p className="text-slate-500 text-center italic">El carrito está vacío</p>}
                </div>

                <div className="border-t border-white/10 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg text-slate-300">Total a Pagar</span>
                        <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={cart.length === 0}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}
