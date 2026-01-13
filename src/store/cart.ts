import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductCandidate } from '@/types/api';

// =============================================
// 로컬 장바구니 아이템 타입 (프론트엔드 전용)
// =============================================

export interface LocalCartItem extends ProductCandidate {
  id: string;
  quantity: number;
  addedAt: number;
}

// =============================================
// 장바구니 상태 (로컬 persist)
// =============================================

interface CartState {
  items: LocalCartItem[];

  // 액션
  addItem: (product: ProductCandidate) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // 계산
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...product,
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              quantity: 1,
              addedAt: Date.now(),
            },
          ],
        })),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),

      getTotalAmount: () =>
        get().items.reduce((acc, item) => {
          // 가격 문자열에서 숫자만 추출 (예: "₩1,200,000" -> 1200000)
          const price = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
          return acc + price * item.quantity;
        }, 0),
    }),
    {
      name: 'whats-on-cart',
    }
  )
);
