import { useCallback, useState } from 'react';

interface UseDaumPostcodeOptions {
  onComplete: (address: string, zonecode: string) => void;
}

// Script loading state (singleton)
let scriptLoadPromise: Promise<void> | null = null;

function loadDaumPostcodeScript(): Promise<void> {
  // Return existing promise if script is already loading
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // Check if script is already loaded
  if (window.daum?.Postcode) {
    return Promise.resolve();
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load Daum Postcode script'));
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

export function useDaumPostcode({ onComplete }: UseDaumPostcodeOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const openPostcode = useCallback(async () => {
    setIsLoading(true);

    try {
      // Dynamically load script if not already loaded
      await loadDaumPostcodeScript();

      if (!window.daum?.Postcode) {
        console.error('Daum Postcode not available after script load');
        return;
      }

      new window.daum.Postcode({
        oncomplete: (data) => {
          // 도로명 주소 우선, 없으면 지번 주소
          const address = data.roadAddress || data.jibunAddress;
          onComplete(address, data.zonecode);
        },
      }).open();
    } catch (error) {
      console.error('Failed to load Daum Postcode:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onComplete]);

  return { openPostcode, isLoading };
}
