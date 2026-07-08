import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product, options = {}) => {
    setItems((current) => {
      const key = `${product.id}-${options.size || "default"}-${options.color || "default"}`;
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => item.key === key ? { ...item, quantity: item.quantity + (options.quantity || 1) } : item);
      }
      return [...current, { key, product, quantity: options.quantity || 1, size: options.size, color: options.color }];
    });
    setIsOpen(true);
  };

  const removeItem = (key) => setItems((current) => current.filter((item) => item.key !== key));
  const updateQuantity = (key, quantity) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item));
  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0), [items]);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);