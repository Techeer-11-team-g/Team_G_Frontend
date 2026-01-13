// =============================================
// API 응답 타입 정의 (API 명세서 기준)
// =============================================

// ─────────────────────────────────────────────
// 공통 타입
// ─────────────────────────────────────────────

/** Bounding Box */
export interface BBox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/** 폴링 URL 정보 */
export interface PollingInfo {
  status_url: string;
  result_url: string;
}

// ─────────────────────────────────────────────
// 이미지 업로드
// ─────────────────────────────────────────────

/** 업로드된 이미지 */
export interface UploadedImage {
  uploaded_image_id: number;
  uploaded_image_url: string;
  created_at: string; // ISO 8601
}

/** 업로드 이미지 목록 응답 */
export interface UploadedImagesResponse {
  items: UploadedImage[];
  next_cursor: number | null;
}

// ─────────────────────────────────────────────
// 상품
// ─────────────────────────────────────────────

/** 상품 정보 */
export interface Product {
  id: number;
  brand_name: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  product_url: string;
}

/** 상품 매치 정보 */
export interface ProductMatch {
  product_id: number;
  product: Product;
}

// ─────────────────────────────────────────────
// 분석
// ─────────────────────────────────────────────

/** 감지된 객체 */
export interface DetectedObject {
  detected_object_id: number;
  category_name: string;
  confidence_score: number;
  bbox: BBox;
  match: ProductMatch;
}

/** 분석 시작 응답 */
export interface AnalysisStartResponse {
  analysis_id: number;
  status: 'PENDING';
  polling: PollingInfo;
}

/** 분석 상태 응답 */
export interface AnalysisStatusResponse {
  analysis_id: number;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';
  progress?: number;
  updated_at: string;
}

/** 분석 결과 응답 */
export interface AnalysisResultResponse {
  analysis_id: number;
  uploaded_image: {
    id: number;
    url: string;
  };
  status: 'DONE';
  items: DetectedObject[];
}

/** 분석 수정 요청 */
export interface AnalysisPatchRequest {
  analysis_id: number;
  query: string;
  detected_object_id: number;
}

// ─────────────────────────────────────────────
// 가상 피팅
// ─────────────────────────────────────────────

/** 가상 피팅 요청 */
export interface FittingRequest {
  detected_object_id: number;
  product_id: number;
  user_image_url: string;
}

/** 가상 피팅 시작 응답 */
export interface FittingStartResponse {
  fitting_image_id: number;
  fitting_image_status: 'PENDING';
  polling: PollingInfo;
}

/** 가상 피팅 상태 응답 */
export interface FittingStatusResponse {
  fitting_image_status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';
  progress?: number;
  updated_at: string;
}

/** 가상 피팅 결과 응답 */
export interface FittingResultResponse {
  fitting_image_id: number;
  fitting_image_status: 'DONE';
  fitting_image_url: string;
  completed_at: string;
}

// ─────────────────────────────────────────────
// 장바구니
// ─────────────────────────────────────────────

/** 장바구니 상품 상세 */
export interface CartProductDetails {
  product_id: number;
  brand_name: string;
  product_name: string;
  selling_price: number;
  main_image_url: string;
  product_url: string;
}

/** 장바구니 아이템 */
export interface CartItem {
  cart_item_id: number;
  selected_product_id: number;
  quantity: number;
  product_details: CartProductDetails;
  created_at: string;
}

/** 장바구니 조회 응답 */
export interface CartResponse {
  items: CartItem[];
  total_quantity: number;
  total_price: number;
}

/** 장바구니 추가 요청 */
export interface CartAddRequest {
  selected_product_id: number;
  quantity: number;
}

/** 장바구니 추가 응답 */
export interface CartAddResponse {
  cart_id: number;
  selected_product_id: number;
  quantity: number;
  created_at: string;
}

// ─────────────────────────────────────────────
// 주문
// ─────────────────────────────────────────────

/** 주문 상태 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/** 주문 생성 요청 */
export interface OrderCreateRequest {
  cart_item_ids: number[];
  payment_method: string;
  user_id: number;
}

/** 주문 생성 응답 */
export interface OrderCreateResponse {
  order_id: number;
  order_status: string;
  total_price: number;
  delivery_address: string;
  created_at: string;
}

/** 주문 목록 아이템 */
export interface OrderListItem {
  order_id: number;
  total_price: number;
  created_at: string;
}

/** 주문 목록 응답 */
export interface OrderListResponse {
  orders: OrderListItem[];
  next_cursor: string | null;
}

/** 주문 상세 아이템 */
export interface OrderDetailItem {
  order_item_id: number;
  order_status: string;
  selected_product_id: number;
  purchased_quantity: number;
  price_at_order: number;
  product_name: string;
}

/** 주문 상세 응답 */
export interface OrderDetailResponse {
  order_id: number;
  total_price: number;
  delivery_address: string;
  order_items: OrderDetailItem[];
  created_at: string;
  updated_at: string;
}

/** 주문 취소 응답 */
export interface OrderCancelResponse {
  order_id: number;
  order_status: 'cancelled';
  updated_at: string;
}

// ─────────────────────────────────────────────
// 사용자
// ─────────────────────────────────────────────

/** 온보딩 요청 */
export interface OnboardingRequest {
  user_email: string;
  address: string;
  payment: string;
  phone_number: string;
}

/** 사용자 프로필 */
export interface UserProfile {
  user_id: number;
  user_name: string;
  user_email: string;
  address: string;
  payment: string;
  phone_number: string;
  birth_date?: string;
  user_image_url?: string;
  created_at: string;
  updated_at: string;
}

/** 사용자 프로필 수정 요청 */
export interface UserProfileUpdateRequest {
  user_name?: string;
  user_email?: string;
  address?: string;
  payment?: string;
  phone_number?: string;
  birth_date?: string;
}

// ─────────────────────────────────────────────
// 히스토리
// ─────────────────────────────────────────────

/** 피팅 정보 */
export interface FittingInfo {
  fitting_image_id: number;
  fitting_image_url: string;
}

/** 히스토리 매치 정보 */
export interface HistoryMatch {
  product_id: number;
  product: Product;
  fitting?: FittingInfo;
}

/** 히스토리 아이템 */
export interface HistoryItem {
  detected_object_id: number;
  category_name: string;
  confidence_score: number;
  bbox: BBox;
  match: HistoryMatch;
}

/** 히스토리 응답 */
export interface HistoryResponse {
  items: HistoryItem[];
}

// ─────────────────────────────────────────────
// 레거시 호환 타입 (기존 코드 호환용)
// ─────────────────────────────────────────────

/** 매칭된 상품 후보 (레거시) */
export interface ProductCandidate {
  brand: string;
  name: string;
  price: string;
  image: string;
  source_url: string;
  match_type: 'Exact' | 'Similar';
  color_vibe: string;
  // 새 API 필드
  product_id?: number;
}

/** 분석된 패션 아이템 (레거시) */
export interface AnalyzedItem {
  id: string;
  label: string;
  category: 'top' | 'bottom' | 'skirt' | 'outer' | 'bag' | 'shoes' | 'hat';
  box_2d: [number, number, number, number];
  description: string;
  aesthetic: string;
  candidates: ProductCandidate[];
}

/** 분석 결과 (레거시) */
export interface AnalysisResult {
  id: string;
  image: string;
  items: AnalyzedItem[];
  summary: string;
  timestamp: number;
}

/** 가상 피팅 결과 (레거시) */
export interface TryOnResult {
  id: string;
  productId: string;
  userPhoto: string;
  resultImage: string;
  createdAt: number;
}
