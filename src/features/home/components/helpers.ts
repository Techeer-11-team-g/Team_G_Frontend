import type { ProductCandidate, ChatProduct } from '@/types/api';

/**
 * Simplifies agent message for display
 * For search results, extracts intro and ending question
 * For other types, limits length and extracts last sentence
 */
export function simplifyMessage(text: string, type: string | undefined, fallback: string): string {
  if (!text) return fallback;

  // For search results, extract intro and ending question
  if (type === 'search_results') {
    // Remove numbered list (1. ... 2. ... etc)
    const lines = text.split('\n').filter((line) => !line.match(/^\d+\.\s/));
    // Get first line (intro) and last line (question)
    const intro = lines[0]?.replace(/:\s*$/, '') || '';
    const question = lines[lines.length - 1] || '';

    if (intro && question && intro !== question) {
      return `${intro}. ${question}`;
    }
    return intro || question || text;
  }

  // For other types, just return the text (but limit length)
  if (text.length > 100) {
    // Find the last sentence
    const sentences = text.split(/[.!?]\s/);
    if (sentences.length > 1) {
      return sentences[sentences.length - 1];
    }
  }

  return text;
}

/**
 * Converts ChatProduct to ProductCandidate for compatibility with existing components
 */
export function chatProductToCandidate(
  product: ChatProduct,
  index: number
): ProductCandidate & { index: number } {
  return {
    brand: product.brand_name,
    name: product.product_name,
    price: product.selling_price,
    image: product.image_url,
    image_url: product.image_url,
    source_url: product.product_url,
    match_type: 'Exact',
    color_vibe: '',
    product_id: product.product_id,
    sizes: product.sizes,
    index: product.index ?? index + 1,
  };
}
