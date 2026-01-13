/**
 * 가격 문자열에서 숫자만 추출
 * @example parsePriceFromString("₩1,200,000") => 1200000
 */
export function parsePriceFromString(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * 숫자를 원화 형식으로 포맷
 * @example formatPrice(1200000) => "₩1,200,000"
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString()}`;
}

/**
 * 장바구니 아이템들의 총 금액 계산
 */
export function calculateTotalPrice(
  items: Array<{ price: string; quantity: number }>
): number {
  return items.reduce((acc, item) => {
    const price = parsePriceFromString(item.price);
    return acc + price * item.quantity;
  }, 0);
}
