// =============================================
// 프론트엔드 로컬 타입 정의
// (API 타입과 별도로 프론트엔드에서만 사용)
// =============================================

import type { AnalyzedItem } from './api';

/** 로컬 히스토리 아이템 */
export interface LocalHistoryItem {
  id: string;
  type: 'analysis';
  image: string;
  summary: string;
  timestamp: number;
}

/** 로컬 분석 결과 (레거시 호환) */
export interface LocalAnalysisResult {
  id: string;
  image: string;
  items: AnalyzedItem[];
  summary: string;
  timestamp: number;
}
