import { create } from 'zustand';

// =============================================
// UI 전역 상태 (서버 데이터 X, UI만!)
// =============================================

interface UIState {
  // 모달 상태
  isCheckoutOpen: boolean;
  isFittingOpen: boolean;
  
  // 선택 상태
  selectedBboxIndex: number | null;
  selectedProductId: string | null;
  
  // 필터
  activeCategory: string;
  
  // 토스트/알림
  toasts: Toast[];
  
  // 액션
  openCheckout: () => void;
  closeCheckout: () => void;
  openFitting: (productId: string) => void;
  closeFitting: () => void;
  selectBbox: (index: number | null) => void;
  setActiveCategory: (category: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useUIStore = create<UIState>((set) => ({
  // 초기 상태
  isCheckoutOpen: false,
  isFittingOpen: false,
  selectedBboxIndex: null,
  selectedProductId: null,
  activeCategory: '전체',
  toasts: [],
  
  // 액션
  openCheckout: () => set({ isCheckoutOpen: true }),
  closeCheckout: () => set({ isCheckoutOpen: false }),
  
  openFitting: (productId) => set({ isFittingOpen: true, selectedProductId: productId }),
  closeFitting: () => set({ isFittingOpen: false, selectedProductId: null }),
  
  selectBbox: (index) => set({ selectedBboxIndex: index }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

