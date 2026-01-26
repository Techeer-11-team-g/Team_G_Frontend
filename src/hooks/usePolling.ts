import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdaptiveInterval } from '@/utils/polling';

type PollingStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

interface PollingOptions<T> {
  /** 폴링 시작 여부 */
  enabled: boolean;
  /** 상태 조회 함수 */
  fetchStatus: () => Promise<T>;
  /** 결과 조회 함수 */
  fetchResult: () => Promise<any>;
  /** 응답에서 상태 추출 */
  getStatus: (data: T) => PollingStatus;
  /** 응답에서 진행률 추출 (0-100) */
  getProgress?: (data: T) => number | undefined;
  /** 최대 폴링 시간 (ms) */
  timeout?: number;
  /** 완료 콜백 */
  onComplete?: (result: any) => void;
  /** 에러 콜백 */
  onError?: (error: Error) => void;
}

interface PollingState<R> {
  status: PollingStatus | null;
  progress: number;
  result: R | null;
  error: Error | null;
  isPolling: boolean;
}

/**
 * 범용 폴링 훅
 * 분석/피팅 등 비동기 작업의 상태를 주기적으로 확인
 */
export function usePolling<T, R = any>({
  enabled,
  fetchStatus,
  fetchResult,
  getStatus,
  getProgress,
  timeout = 60000, // 60초
  onComplete,
  onError,
}: PollingOptions<T>): PollingState<R> {
  const [state, setState] = useState<PollingState<R>>({
    status: null,
    progress: 0,
    result: null,
    error: null,
    isPolling: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const statusData = await fetchStatus();
      const currentStatus = getStatus(statusData);
      const progress = getProgress?.(statusData) ?? 0;

      if (!isMountedRef.current) return;

      setState((prev) => ({
        ...prev,
        status: currentStatus,
        progress,
      }));

      if (currentStatus === 'DONE') {
        cleanup();
        try {
          const result = await fetchResult();
          if (!isMountedRef.current) return;

          setState((prev) => ({
            ...prev,
            result,
            isPolling: false,
          }));
          onComplete?.(result);
        } catch (err) {
          if (!isMountedRef.current) return;
          const error = err instanceof Error ? err : new Error('결과 조회 실패');
          setState((prev) => ({
            ...prev,
            error,
            isPolling: false,
          }));
          onError?.(error);
        }
      } else if (currentStatus === 'FAILED') {
        cleanup();
        const error = new Error('처리 중 오류가 발생했습니다');
        setState((prev) => ({
          ...prev,
          error,
          isPolling: false,
        }));
        onError?.(error);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Polling error:', err);
      // 네트워크 에러 등은 무시하고 계속 폴링
    }
  }, [fetchStatus, fetchResult, getStatus, getProgress, cleanup, onComplete, onError]);

  const scheduleNextPoll = useCallback(() => {
    if (!isMountedRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= timeout) {
      cleanup();
      const error = new Error('처리 시간이 초과되었습니다');
      setState((prev) => ({ ...prev, error, isPolling: false }));
      onError?.(error);
      return;
    }
    const nextInterval = getAdaptiveInterval(elapsed);
    intervalRef.current = setTimeout(async () => {
      await poll();
      scheduleNextPoll();
    }, nextInterval);
  }, [poll, timeout, cleanup, onError]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled) {
      cleanup();
      setState({
        status: null,
        progress: 0,
        result: null,
        error: null,
        isPolling: false,
      });
      return;
    }

    // 폴링 시작
    setState((prev) => ({ ...prev, isPolling: true, error: null }));
    startTimeRef.current = Date.now();

    // 즉시 첫 폴링 실행 후 adaptive 스케줄링
    (async () => {
      await poll();
      scheduleNextPoll();
    })();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [enabled, poll, timeout, cleanup, onError, scheduleNextPoll]);

  return state;
}
