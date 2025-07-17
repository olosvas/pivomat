import { create } from 'zustand';
import { Beverage } from '@shared/schema';

export interface CartItem {
  id: string;
  beverageId: string;
  name: string;
  nameEn: string;
  nameSk: string;
  pricePerLiter: number;
  volume: number;
  subtotal: number;
  requiresAgeVerification: boolean;
}

interface CartState {
  items: CartItem[];
  total: number;
  requiresAgeVerification: boolean;
  addItem: (beverage: Beverage, volume: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, volume: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  requiresAgeVerification: false,
  
  addItem: (beverage, volume) => {
    const { items, calculateTotal } = get();
    const itemId = `${beverage.id}_${Date.now()}`;
    const subtotal = parseFloat(beverage.pricePerLiter) * volume;
    
    const newItem: CartItem = {
      id: itemId,
      beverageId: beverage.id,
      name: beverage.name,
      nameEn: beverage.nameEn,
      nameSk: beverage.nameSk,
      pricePerLiter: parseFloat(beverage.pricePerLiter),
      volume,
      subtotal,
      requiresAgeVerification: beverage.requiresAgeVerification || false,
    };
    
    set({ items: [...items, newItem] });
    calculateTotal();
  },
  
  removeItem: (itemId) => {
    const { items, calculateTotal } = get();
    set({ items: items.filter(item => item.id !== itemId) });
    calculateTotal();
  },
  
  updateQuantity: (itemId, volume) => {
    const { items, calculateTotal } = get();
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            volume: Math.max(0.1, Math.min(1.0, volume)),
            subtotal: item.pricePerLiter * Math.max(0.1, Math.min(1.0, volume))
          }
        : item
    );
    
    set({ items: updatedItems });
    calculateTotal();
  },
  
  clearCart: () => {
    set({ items: [], total: 0, requiresAgeVerification: false });
  },
  
  calculateTotal: () => {
    const { items } = get();
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const requiresAgeVerification = items.some(item => item.requiresAgeVerification);
    set({ total, requiresAgeVerification });
  },
}));
