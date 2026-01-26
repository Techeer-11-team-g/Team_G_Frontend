/**
 * Adaptive polling interval
 * 경과 시간에 따라 polling 간격을 동적으로 조절
 *
 * 0~5초:    500ms  (캐시 히트 등 빠른 완료 캐치)
 * 5~16초:   1500ms (작업 진행 중)
 * 16~30초:  500ms  (완료 임박, 빠르게 캐치)
 * 30초~:    2000ms (비정상적으로 오래 걸리는 경우)
 */
export function getAdaptiveInterval(elapsedMs: number): number {
  if (elapsedMs < 5000) return 500;
  if (elapsedMs < 16000) return 1500;
  if (elapsedMs < 30000) return 500;
  return 2000;
}
