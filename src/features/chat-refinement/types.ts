/** 채팅 메시지 역할 */
export type MessageRole = 'user' | 'assistant';

/** 단일 채팅 메시지 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** 수정 대상 감지 객체 ID */
  detectedObjectId?: number;
  /** 로딩 상태 (어시스턴트 메시지용) */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: string;
}

/** 추천 프롬프트 */
export interface SuggestedPrompt {
  id: string;
  label: string;
  queryTemplate: string;
  icon?: string;
}

/** 기본 추천 프롬프트 목록 */
export const DEFAULT_PROMPTS: SuggestedPrompt[] = [
  { id: '1', label: '색상 변경', queryTemplate: '다른 색상으로 검색해줘', icon: '🎨' },
  { id: '2', label: '스타일 변경', queryTemplate: '비슷한 스타일로 추천해줘', icon: '✨' },
  { id: '3', label: '가격대 조정', queryTemplate: '더 저렴한 제품 찾아줘', icon: '💰' },
  { id: '4', label: '브랜드 변경', queryTemplate: '다른 브랜드 제품 보여줘', icon: '🏷️' },
];
