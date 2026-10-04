import { createContext, useContext, useState, type ReactNode } from "react";
import type { MenuItem } from "../types";

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  lines: CartLine[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  total: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  function addItem(item: MenuItem) {
    setLines((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }

  function decreaseItem(itemId: string) {
    setLines((prev) =>
      prev
        .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity - 1 } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeItem(itemId: string) {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }

  function clearCart() {
    setLines([]);
  }

  const total = lines.reduce(
    (sum, l) => sum + Number(l.item.price) * l.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ lines, addItem, removeItem, decreaseItem, total, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}