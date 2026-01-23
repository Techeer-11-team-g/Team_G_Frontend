import { useState, useEffect, useCallback } from 'react';

// Typewriter Hook
export function useTypewriter(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(
      () => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      },
      speed + Math.random() * 30
    );

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}

// Scroll position detection hook
export function useScrollPosition(threshold: number = 0.7) {
  const [isInFeedSection, setIsInFeedSection] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsInFeedSection(scrollY > viewportHeight * threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isInFeedSection;
}

// Keyboard height detection hook
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const newKeyboardHeight = window.innerHeight - viewport.height;
      setKeyboardHeight(Math.max(0, newKeyboardHeight));
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return keyboardHeight;
}

// Scroll to top on mount hook
export function useScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

// File upload handler hook
export function useFileUpload() {
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setPendingImagePreview(imageData);
      setPreviewImage(imageData);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  }, []);

  const clearPendingImage = useCallback(() => {
    setPendingImageFile(null);
    setPendingImagePreview(null);
  }, []);

  const resetAll = useCallback(() => {
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setPreviewImage(null);
  }, []);

  return {
    pendingImageFile,
    pendingImagePreview,
    previewImage,
    setPreviewImage,
    handleFileChange,
    clearPendingImage,
    resetAll,
  };
}

// Request type determination
export type RequestType = 'idle' | 'text_search' | 'image_search' | 'fitting' | 'cart' | 'order';

export function useRequestType() {
  const [currentRequestType, setCurrentRequestType] = useState<RequestType>('idle');

  const getRequestType = useCallback((query: string, hasImage: boolean): RequestType => {
    if (hasImage) return 'image_search';
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('피팅') || lowerQuery.includes('입어')) return 'fitting';
    if (lowerQuery.includes('담아') || lowerQuery.includes('장바구니')) return 'cart';
    if (lowerQuery.includes('주문') || lowerQuery.includes('구매') || lowerQuery.includes('결제'))
      return 'order';
    return 'text_search';
  }, []);

  return { currentRequestType, setCurrentRequestType, getRequestType };
}
