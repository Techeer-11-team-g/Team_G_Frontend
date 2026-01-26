/**
 * Polling interval
 * 전 구간 500ms 고정 - 상태 체크는 가벼운 GET이라 서버 부담 없음
 */
export function getAdaptiveInterval(_elapsedMs: number): number {
  return 500;
}
