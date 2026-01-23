import { useState, useCallback, useEffect, useRef } from 'react';
import { haptic } from '@/motion';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'error';

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceInputReturn {
  isSupported: boolean;
  state: VoiceInputState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    language = 'ko-KR',
    continuous = false,
    interimResults = true,
    onResult,
    onInterimResult,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Use refs to avoid stale closures
  const interimRef = useRef('');
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const hasSubmittedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Check browser support and setup recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setState('listening');
        setError(null);
        hasSubmittedRef.current = false;
        interimRef.current = '';
        haptic('tap');
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript((prev) => prev + finalTranscript);
          hasSubmittedRef.current = true;
          onResultRef.current?.(finalTranscript);
          haptic('success');
          interimRef.current = '';
        }

        if (interim) {
          interimRef.current = interim;
          setInterimTranscript(interim);
          onInterimResult?.(interim);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = '음성 인식 오류가 발생했습니다';

        switch (event.error) {
          case 'no-speech':
            errorMessage = '음성이 감지되지 않았습니다';
            break;
          case 'audio-capture':
            errorMessage = '마이크를 찾을 수 없습니다';
            break;
          case 'not-allowed':
            errorMessage = '마이크 권한이 필요합니다';
            break;
          case 'network':
            errorMessage = '네트워크 오류가 발생했습니다';
            break;
          case 'aborted':
            // User aborted, not an error
            return;
        }

        setError(errorMessage);
        setState('error');
        onErrorRef.current?.(errorMessage);
        haptic('error');
      };

      recognitionRef.current.onend = () => {
        // If there's interim text that wasn't finalized, send it now
        if (interimRef.current && !hasSubmittedRef.current) {
          const textToSend = interimRef.current.trim();
          if (textToSend) {
            setTranscript(textToSend);
            onResultRef.current?.(textToSend);
            haptic('success');
          }
        }

        setState('idle');
        setInterimTranscript('');
        interimRef.current = '';
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, interimResults, onInterimResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('음성 인식이 지원되지 않는 브라우저입니다');
      setState('error');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Recognition already started
      console.warn('Recognition already started');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState('idle');
      setInterimTranscript('');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setState('idle');
  }, []);

  return {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
