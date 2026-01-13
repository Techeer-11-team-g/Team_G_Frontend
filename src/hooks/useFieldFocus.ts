import { useState, useCallback } from 'react';

/**
 * 폼 필드 포커스 상태 관리 훅
 * 여러 입력 필드의 포커스 상태를 추적하고 관리
 */
export function useFieldFocus<T extends string = string>() {
  const [focusedField, setFocusedField] = useState<T | null>(null);

  const handleFocus = useCallback((fieldName: T) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const isFocused = useCallback(
    (fieldName: T) => focusedField === fieldName,
    [focusedField]
  );

  const getFieldProps = useCallback(
    (fieldName: T) => ({
      onFocus: () => handleFocus(fieldName),
      onBlur: handleBlur,
    }),
    [handleFocus, handleBlur]
  );

  return {
    focusedField,
    handleFocus,
    handleBlur,
    isFocused,
    getFieldProps,
  };
}
