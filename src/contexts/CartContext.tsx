'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    variantId: string;
    productName: string;
    variantName: string;
    price: number;
    quantity: number;
    buttonsType: 'COMMON' | 'LED';
    ledSurcharge: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
    updateQuantity: (variantId: string, buttonsType: string, quantity: number) => void;
    removeItem: (variantId: string, buttonsType: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(i =>
                i.variantId === item.variantId && i.buttonsType === item.buttonsType
            );

            if (existingItem) {
                // Update quantity if item already exists
                return currentItems.map(i =>
                    (i.variantId === item.variantId && i.buttonsType === item.buttonsType)
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            } else {
                // Add new item
                return [...currentItems, { ...item, quantity }];
            }
        });
    };


    const updateQuantity = (variantId: string, buttonsType: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(variantId, buttonsType);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                (item.variantId === variantId && item.buttonsType === buttonsType)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const removeItem = (variantId: string, buttonsType: string) => {
        setItems(currentItems =>
            currentItems.filter(item => !(item.variantId === variantId && item.buttonsType === buttonsType))
        );
    };


    const clearCart = () => {
        setItems([]);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                getTotalItems,
                getTotalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
