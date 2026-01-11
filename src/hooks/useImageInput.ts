import { useState, useRef, useCallback } from 'react';

export type InputMode = 'upload' | 'paste' | 'url';

interface UseImageInputOptions {
  onImageReady: (base64Image: string) => void;
  onError?: (message: string) => void;
}

interface UseImageInputReturn {
  // State
  inputMode: InputMode;
  urlInput: string;
  showPasteTooltip: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;

  // Actions
  setInputMode: (mode: InputMode) => void;
  setUrlInput: (url: string) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaste: () => Promise<void>;
  handleUrlSubmit: (e: React.FormEvent) => void;
  triggerFileInput: () => void;
}

export function useImageInput({
  onImageReady,
  onError,
}: UseImageInputOptions): UseImageInputReturn {
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [showPasteTooltip, setShowPasteTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  // Show tooltip when paste mode is selected
  const handleSetInputMode = useCallback((mode: InputMode) => {
    setInputMode(mode);
    if (mode === 'paste') {
      setShowPasteTooltip(true);
      setTimeout(() => setShowPasteTooltip(false), 3000);
    }
  }, []);

  // File upload handler
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageReady(base64);
      };
      reader.onerror = () => {
        onError?.('파일을 읽는 중 오류가 발생했습니다.');
      };
      reader.readAsDataURL(file);
    },
    [onImageReady, onError]
  );

  // Clipboard paste handler
  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              onImageReady(base64);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      onError?.('클립보드에 이미지가 없습니다.');
    } catch {
      onError?.('붙여넣기 권한이 거부되었습니다.');
    }
  }, [onImageReady, onError]);

  // URL submit handler
  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!urlInput) return;

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = urlInput;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        onImageReady(dataURL);
      };
      img.onerror = () => {
        onError?.(
          '이미지 주소가 올바르지 않거나 보안 정책(CORS)으로 인해 접근할 수 없습니다.'
        );
      };
    },
    [urlInput, onImageReady, onError]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    inputMode,
    urlInput,
    showPasteTooltip,
    fileInputRef,
    setInputMode: handleSetInputMode,
    setUrlInput,
    handleFileChange,
    handlePaste,
    handleUrlSubmit,
    triggerFileInput,
  };
}
