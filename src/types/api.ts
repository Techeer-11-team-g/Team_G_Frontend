// =============================================
// API 응답 타입 정의
// =============================================

/** 매칭된 상품 후보 */
export interface ProductCandidate {
  brand: string;
  name: string;
  price: string;
  image: string;
  source_url: string;
  match_type: "Exact" | "Similar";
  color_vibe: string;
}

/** 분석된 패션 아이템 */
export interface AnalyzedItem {
  id: string;
  label: string;
  category: "top" | "bottom" | "skirt" | "outer" | "bag" | "shoes" | "hat";
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  description: string;
  aesthetic: string;
  candidates: ProductCandidate[];
}

/** 분석 결과 응답 */
export interface AnalysisResult {
  id: string;
  image: string;
  items: AnalyzedItem[];
  summary: string;
  timestamp: number;
}

/** 장바구니 아이템 */
export interface CartItem extends ProductCandidate {
  id: string;
  quantity: number;
  addedAt: number;
}

/** 주문 상태 */
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** 주문 */
export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: number;
  updatedAt: number;
}

/** 배송 주소 */
export interface ShippingAddress {
  name: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
}

/** 가상 피팅 결과 */
export interface TryOnResult {
  id: string;
  productId: string;
  userPhoto: string;
  resultImage: string;
  createdAt: number;
}

/** 히스토리 아이템 */
export interface HistoryItem {
  id: string;
  type: "analysis" | "tryon";
  image: string;
  summary: string;
  timestamp: number;
}
