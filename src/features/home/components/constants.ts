// Agent Messages
export const AGENT_MESSAGES = {
  idle: [
    '이미지를 업로드해서 상품을 찾아보세요.',
    '오늘은 어떤 상품을 찾고 계신가요?',
    '이미지를 넣어주시면 상품을 찾아드릴게요.',
  ],
  thinking: ['분석 중이에요...', '잠시만 기다려주세요...'],
  searching: ['최적의 상품을 찾고 있어요...', '수천 개의 상품 중에서 검색 중이에요...'],
  presenting: ['딱 맞는 상품을 찾았어요!', '좋은 상품들을 찾았어요'],
  error: ['문제가 발생했어요. 다시 시도해주세요', '이미지를 처리할 수 없었어요'],
};

// Context-aware progress messages
export type RequestType = 'idle' | 'image_search' | 'text_search' | 'fitting' | 'cart' | 'order';

export const PROGRESS_MESSAGES: Record<RequestType, { thinking: string[]; searching: string[] }> = {
  idle: {
    thinking: ['처리 중...'],
    searching: ['검색 중...'],
  },
  image_search: {
    thinking: ['이미지 분석 중...', '스타일 파악 중...', '패션 아이템 감지 중...'],
    searching: ['비슷한 상품 찾는 중...', '매칭 상품 검색 중...', '거의 다 됐어요...'],
  },
  text_search: {
    thinking: ['요청 분석 중...', '검색어 이해 중...'],
    searching: ['상품 검색 중...', '최적의 상품 찾는 중...', '거의 완료...'],
  },
  fitting: {
    thinking: ['피팅 준비 중...', '가상 피팅 시작...'],
    searching: ['AI가 피팅 이미지 생성 중...', '잠시만 기다려주세요...', '거의 완료...'],
  },
  cart: {
    thinking: ['장바구니에 추가 중...'],
    searching: ['처리 중...'],
  },
  order: {
    thinking: ['주문 처리 중...'],
    searching: ['결제 준비 중...'],
  },
};
