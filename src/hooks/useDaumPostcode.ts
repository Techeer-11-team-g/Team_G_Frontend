import { useCallback } from 'react';

interface UseDaumPostcodeOptions {
  onComplete: (address: string, zonecode: string) => void;
}

export function useDaumPostcode({ onComplete }: UseDaumPostcodeOptions) {
  const openPostcode = useCallback(() => {
    if (!window.daum?.Postcode) {
      console.error('Daum Postcode script not loaded');
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        // 도로명 주소 우선, 없으면 지번 주소
        const address = data.roadAddress || data.jibunAddress;
        onComplete(address, data.zonecode);
      },
    }).open();
  }, [onComplete]);

  return { openPostcode };
}
