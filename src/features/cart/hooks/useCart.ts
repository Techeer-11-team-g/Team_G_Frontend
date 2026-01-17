import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartApi } from '@/api';
import type { CartResponse, CartAddRequest } from '@/types/api';

export function useCart() {
  const queryClient = useQueryClient();

  // 장바구니 조회
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  });

  // 장바구니 추가
  const addMutation = useMutation({
    mutationFn: (request: CartAddRequest) => cartApi.add(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('장바구니에 추가되었습니다');
    },
    onError: () => {
      toast.error('장바구니 추가에 실패했습니다');
    },
  });

  // 장바구니 삭제
  const removeMutation = useMutation({
    mutationFn: (cartItemId: number) => cartApi.remove(cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('상품이 삭제되었습니다');
    },
    onError: () => {
      toast.error('삭제에 실패했습니다');
    },
  });

  const addToCart = async (selectedProductId: number, quantity: number = 1) => {
    await addMutation.mutateAsync({ selected_product_id: selectedProductId, quantity });
  };

  const removeFromCart = async (cartItemId: number) => {
    await removeMutation.mutateAsync(cartItemId);
  };

  return {
    cart,
    items: cart?.items || [],
    totalQuantity: cart?.total_quantity || 0,
    totalPrice: cart?.total_price || 0,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
