// =============================================
// API 응답 타입 정의 (API 명세서 기준)
// =============================================

// ─────────────────────────────────────────────
// 인증 (JWT)
// ─────────────────────────────────────────────

/** 회원가입 요청 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

/** 회원가입 응답 */
export interface RegisterResponse {
  user: {
    user_id: number;
    username: string;
    email: string;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

/** 로그인 요청 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 로그인 응답 */
export interface LoginResponse {
  refresh: string;
  access: string;
}

/** Google 로그인 요청 */
export interface GoogleLoginRequest {
  credential: string;
}

/** Google 로그인 응답 */
export interface GoogleLoginResponse {
  access: string;
  refresh: string;
  user: {
    user_id: number;
    username: string;
    email: string;
  };
  is_new_user?: boolean;
}

/** 토큰 갱신 요청 */
export interface RefreshRequest {
  refresh: string;
}

/** 토큰 갱신 응답 */
export interface RefreshResponse {
  access: string;
  refresh: string;
}

/** 인증된 유저 정보 */
export interface AuthUser {
  user_id: number;
  username: string;
  email: string;
}

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
  created_at: string;
  auto_analyze?: boolean;
  analysis_id?: number;
}

/** 업로드 이미지 목록 응답 */
export interface UploadedImagesResponse {
  items: UploadedImage[];
  next_cursor: string | null;
}

// ─────────────────────────────────────────────
// 유저 이미지 (전신 사진)
// ─────────────────────────────────────────────

/** 유저 전신 이미지 */
export interface UserImage {
  user_image_id: number;
  user_image_url: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// 상품
// ─────────────────────────────────────────────

/** 상품 사이즈 정보 */
export interface ProductSize {
  size_code_id: number;
  size_value?: string;
  size?: string; // Alternative field name from some API responses
  inventory?: number;
  selected_product_id: number;
}

/** 상품 정보 */
export interface Product {
  id: number;
  brand_name: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  product_url: string;
  sizes?: ProductSize[] | string[];
}

/** 상품 매치 정보 */
export interface ProductMatch {
  product_id: number;
  product: Product;
}

// ─────────────────────────────────────────────
// 분석
// ─────────────────────────────────────────────

/** 분석 상태 */
export type AnalysisStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

/** 감지된 객체 */
export interface DetectedObject {
  detected_object_id: number;
  category_name: string;
  confidence_score: number;
  bbox: BBox;
  match: ProductMatch | null;
}

/** 분석 시작 요청 */
export interface AnalysisStartRequest {
  uploaded_image_id: number;
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
  status: AnalysisStatus;
  progress: number;
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

/** 피팅 상태 */
export type FittingStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

/** 가상 피팅 요청 */
export interface FittingRequest {
  product_id: number;
  user_image_url: string;
}

/** 가상 피팅 시작 응답 */
export interface FittingStartResponse {
  fitting_image_id: number;
  fitting_image_status: 'PENDING' | 'DONE';
  fitting_image_url: string | null;
  polling?: PollingInfo;
  completed_at: string;
}

/** 가상 피팅 상태 응답 */
export interface FittingStatusResponse {
  fitting_image_status: FittingStatus;
  progress: number;
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
  size: string | null;
  inventory: number;
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
export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

/** 주문 생성 요청 */
export interface OrderCreateRequest {
  cart_item_ids: number[];
  user_id: number;
  payment_method: string;
}

/** 주문 생성 응답 */
export interface OrderCreateResponse {
  order_id: number;
  total_price: number;
  delivery_address: string;
  created_at: string;
  order_status: string;
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
  phone_number: string | null;
  address: string | null;
  birth_date: string | null;
  user_image_url: string | null;
  payment: string | null;
  updated_at: string;
  created_at: string;
}

/** 사용자 프로필 수정 요청 */
export interface UserProfileUpdateRequest {
  phone_number?: string;
  address?: string;
  birth_date?: string;
  user_image_url?: string;
  payment?: string;
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
  next_cursor: string | null;
}

// ─────────────────────────────────────────────
// 피드 (Pinterest 스타일)
// ─────────────────────────────────────────────

/** 피드 사용자 정보 */
export interface FeedUser {
  id: number;
  username: string;
}

/** 피드 상품 사이즈 */
export interface FeedProductSize {
  size_code_id: number;
  size_value: string;
}

/** 피드 매칭 상품 */
export interface FeedMatchedProduct {
  id: number;
  brand_name: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  product_url: string;
  sizes?: FeedProductSize[];
}

/** 피드 바운딩 박스 */
export interface FeedBBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 피드 감지 객체 */
export interface FeedDetectedObject {
  id: number;
  category: string;
  cropped_image_url?: string;
  bbox?: FeedBBox;
  matched_product: FeedMatchedProduct | null;
}

/** 피드 아이템 */
export interface FeedItem {
  id: number;
  uploaded_image_url: string;
  user: FeedUser;
  created_at: string;
  is_public: boolean;
  analysis_status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  analysis_id?: number;
  style_tag1?: string;
  style_tag2?: string;
  detected_objects: FeedDetectedObject[];
}

/** 피드 응답 */
export interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
}

/** 스타일 옵션 */
export interface StyleOption {
  value: string;
  label: string;
}

/** 스타일 목록 응답 */
export interface StylesResponse {
  styles: StyleOption[];
}

/** 공개/비공개 토글 요청 */
export interface VisibilityToggleRequest {
  is_public: boolean;
}

// ─────────────────────────────────────────────
// 레거시 호환 타입 (기존 코드 호환용)
// ─────────────────────────────────────────────

/** 매칭된 상품 후보 (레거시) */
export interface ProductCandidate {
  brand: string;
  name: string;
  price: string | number;
  image: string;
  source_url: string;
  match_type: 'Exact' | 'Similar';
  color_vibe: string;
  // 새 API 필드
  product_id?: number;
  image_url?: string;
  similarity_score?: number;
  sizes?: ProductSize[] | string[];
  detected_object_id?: number;
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

// ─────────────────────────────────────────────
// 채팅 API (통합 인터페이스)
// ─────────────────────────────────────────────

/** 채팅 응답 타입 */
export type ChatResponseType =
  | 'search_results'
  | 'no_results'
  | 'analysis_pending'
  | 'fitting_pending'
  | 'fitting_result'
  | 'batch_fitting_pending'
  | 'cart_added'
  | 'cart_list'
  | 'cart_empty'
  | 'order_created'
  | 'size_recommendation'
  | 'ask_selection'
  | 'ask_size'
  | 'ask_body_info'
  | 'ask_user_image'
  | 'ask_search_first'
  | 'greeting'
  | 'help'
  | 'general'
  | 'error';

/** Bounding Box for detected object overlay */
export interface ChatBBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 채팅 상품 정보 */
export interface ChatProduct {
  index?: number;
  product_id: number;
  brand_name: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  product_url: string;
  sizes?: string[];
  // Image analysis specific fields
  category?: string;
  confidence_score?: number;
  detected_object_id?: number;
  bbox?: ChatBBox;
}

/** 채팅 장바구니 아이템 */
export interface ChatCartItem {
  cart_item_id: number;
  product: ChatProduct;
  size: string;
  quantity: number;
}

/** 채팅 Suggestion */
export interface ChatSuggestion {
  label: string;
  action: string;
}

/** 채팅 응답 데이터 */
export interface ChatResponseData {
  // search_results
  products?: ChatProduct[];
  total_count?: number;
  understood_intent?: string;

  // fitting
  fitting_id?: number;
  fitting_ids?: number[];
  fitting_image_url?: string;
  color_match_score?: number;

  // cart
  items?: ChatCartItem[];
  total_price?: number;
  item_count?: number;

  // order
  order_id?: number;
  items_count?: number;

  // size
  recommended_size?: string;
  available_sizes?: string[];
  confidence?: number;

  // status (pending)
  analysis_id?: number;
  status_url?: string;

  // error
  error_type?: string;

  // common
  product?: ChatProduct;
  size?: string;
  quantity?: number;

  // ask_selection
  options?: ChatProduct[];

  // image analysis
  uploaded_image_url?: string;
  uploaded_image_id?: number;
}

/** 채팅 응답 본문 */
export interface ChatResponseBody {
  text: string;
  type: ChatResponseType;
  data: ChatResponseData;
  suggestions: ChatSuggestion[];
}

/** 채팅 컨텍스트 */
export interface ChatContext {
  current_analysis_id?: number;
  has_search_results: boolean;
  has_user_image: boolean;
  cart_item_count: number;
}

/** 채팅 API 응답 */
export interface ChatResponse {
  session_id: string;
  response: ChatResponseBody;
  context: ChatContext;
}

/** 채팅 상태 확인 요청 */
export interface ChatStatusRequest {
  type: 'analysis' | 'fitting';
  id: number;
  session_id: string;
}

/** 채팅 세션 턴 */
export interface ChatTurn {
  user: string;
  assistant: string;
  timestamp: string;
}

/** 채팅 세션 정보 */
export interface ChatSession {
  session_id: string;
  user_id: number;
  created_at: string;
  last_activity: string;
  has_search_results: boolean;
  has_user_image: boolean;
  cart_item_count: number;
  turns: ChatTurn[];
}
