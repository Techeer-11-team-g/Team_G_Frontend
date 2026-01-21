import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, Lock, X, ChevronDown, ShoppingBag, Package } from 'lucide-react';
import { feedApi, cartApi, ordersApi } from '@/api';
import { cn } from '@/utils/cn';
import { haptic, springs } from '@/motion';
import { toast } from 'sonner';
import { useUserStore } from '@/store';
import type { FeedItem, UserProfile } from '@/types/api';

type FeedTab = 'discover' | 'history';

interface PinterestFeedProps {
  className?: string;
}

// Single Pinterest Card - Image only, natural aspect ratio
function PinterestCard({
  item,
  onClick,
  onVisibilityToggle,
  isOwn,
}: {
  item: FeedItem;
  onClick: () => void;
  onVisibilityToggle?: (isPublic: boolean) => void;
  isOwn: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleVisibilityToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isToggling || !onVisibilityToggle) return;
    setIsToggling(true);
    haptic('tap');
    try {
      await onVisibilityToggle(!item.is_public);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <motion.div
      className="cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Placeholder while loading */}
        {!loaded && (
          <div className="w-full aspect-[3/4] bg-zinc-800 animate-pulse" />
        )}

        {/* Image - natural aspect ratio */}
        <img
          src={item.uploaded_image_url}
          alt="Feed item"
          className={cn(
            "w-full object-cover transition-transform duration-300 group-hover:scale-105",
            !loaded && "hidden"
          )}
          onLoad={() => setLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* User info (Discover) - shows on hover */}
        {!isOwn && item.user && (
          <motion.div
            className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span className="text-[10px] text-white font-bold">
                {item.user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-white font-medium drop-shadow-lg">
              {item.user.username}
            </span>
          </motion.div>
        )}

        {/* Visibility toggle (History) */}
        {isOwn && (
          <motion.button
            onClick={handleVisibilityToggle}
            disabled={isToggling}
            className={cn(
              "absolute top-3 right-3 px-2.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all",
              item.is_public
                ? "bg-emerald-500/25 border-emerald-500/30"
                : "bg-black/40 border-white/10"
            )}
            style={{
              backdropFilter: 'blur(8px)',
              border: '1px solid',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            {item.is_public ? (
              <Globe size={12} className="text-emerald-400" />
            ) : (
              <Lock size={12} className="text-white/50" />
            )}
            <span className={cn(
              "text-[10px] font-medium",
              item.is_public ? "text-emerald-400" : "text-white/50"
            )}>
              {item.is_public ? '공개' : '비공개'}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Expanded Post View - Full screen with scroll to next
function ExpandedPostView({
  items,
  initialIndex,
  isOwn,
  onClose,
  onVisibilityToggle,
}: {
  items: FeedItem[];
  initialIndex: number;
  isOwn: boolean;
  onClose: () => void;
  onVisibilityToggle: (itemId: number, isPublic: boolean) => Promise<void>;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { user } = useUserStore();

  // Scroll to initial post
  useEffect(() => {
    if (scrollRef.current) {
      const postHeight = window.innerHeight;
      scrollRef.current.scrollTop = initialIndex * postHeight;
    }
  }, [initialIndex]);

  // Track scroll position to update current index
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const postHeight = window.innerHeight;
      const newIndex = Math.round(scrollRef.current.scrollTop / postHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
        setCurrentIndex(newIndex);
        haptic('tap');
      }
    };

    const container = scrollRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [currentIndex, items.length]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Close Button */}
      <motion.button
        onClick={onClose}
        className="absolute top-12 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X size={24} className="text-white" />
      </motion.button>

      {/* Progress Indicator */}
      <div className="absolute top-12 left-4 z-50 flex gap-1">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              idx === currentIndex ? "bg-white w-4" : "bg-white/30"
            )}
          />
        ))}
      </div>

      {/* Scrollable Posts Container */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, index) => (
          <ExpandedPost
            key={item.id}
            item={item}
            isOwn={isOwn}
            isActive={index === currentIndex}
            onVisibilityToggle={onVisibilityToggle}
            user={user}
          />
        ))}
      </div>

      {/* Scroll hint */}
      {currentIndex < items.length - 1 && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-white/40 text-xs">스크롤하여 더 보기</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={20} className="text-white/40" />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Single Expanded Post
function ExpandedPost({
  item,
  isOwn,
  isActive,
  onVisibilityToggle,
  user,
}: {
  item: FeedItem;
  isOwn: boolean;
  isActive: boolean;
  onVisibilityToggle: (itemId: number, isPublic: boolean) => Promise<void>;
  user: UserProfile | null;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [selectedSizeCodeId, setSelectedSizeCodeId] = useState<number | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Calculate image size
  useEffect(() => {
    if (!imageRef.current || !imageLoaded) return;

    const updateImageSize = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight,
        });
      }
    };

    const timeoutId = setTimeout(updateImageSize, 50);
    const resizeObserver = new ResizeObserver(updateImageSize);
    resizeObserver.observe(imageRef.current);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [imageLoaded]);

  const objectsWithBBox = item.detected_objects?.filter((obj) => obj.bbox) || [];
  const selectedObject = item.detected_objects?.find((obj) => obj.id === selectedObjectId);
  const selectedProduct = selectedObject?.matched_product;
  const availableSizes = selectedProduct?.sizes || [];

  const handleBBoxClick = (e: React.MouseEvent, objectId: number) => {
    e.stopPropagation();
    haptic('tap');
    setSelectedObjectId(objectId);
    setSelectedSizeCodeId(null);
  };

  const handleVisibilityToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    haptic('tap');
    try {
      await onVisibilityToggle(item.id, !item.is_public);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;
    if (availableSizes.length > 0 && !selectedSizeCodeId) {
      toast.error('사이즈를 선택해주세요');
      return;
    }

    setIsAddingToCart(true);
    haptic('tap');

    try {
      const productIdToUse = selectedSizeCodeId || selectedProduct.id;
      await cartApi.add({
        selected_product_id: productIdToUse,
        quantity: 1,
      });
      toast.success('장바구니에 추가되었습니다');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('장바구니 추가에 실패했습니다');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    if (availableSizes.length > 0 && !selectedSizeCodeId) {
      toast.error('사이즈를 선택해주세요');
      return;
    }
    if (!user?.user_id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsPurchasing(true);
    haptic('tap');

    try {
      const productIdToUse = selectedSizeCodeId || selectedProduct.id;
      const cartResponse = await cartApi.add({
        selected_product_id: productIdToUse,
        quantity: 1,
      });

      await ordersApi.create({
        cart_item_ids: [cartResponse.cart_id],
        user_id: user.user_id,
        payment_method: 'card',
      });

      toast.success('주문이 완료되었습니다');
    } catch (error) {
      console.error('Failed to purchase:', error);
      toast.error('주문 처리에 실패했습니다');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="h-screen w-full snap-start flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-14 bg-black/50">
        <div className="flex items-center gap-3">
          {item.user && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm text-white font-bold">
                  {item.user.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{item.user.username}</p>
                <p className="text-white/40 text-[10px]">
                  {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Visibility Toggle for own posts */}
        {isOwn && (
          <motion.button
            onClick={handleVisibilityToggle}
            disabled={isToggling}
            className={cn(
              "px-3 py-2 rounded-full flex items-center gap-2 transition-all",
              item.is_public
                ? "bg-emerald-500/25 border-emerald-500/30"
                : "bg-white/10 border-white/10"
            )}
            style={{ border: '1px solid' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            {item.is_public ? (
              <Globe size={14} className="text-emerald-400" />
            ) : (
              <Lock size={14} className="text-white/50" />
            )}
            <span className={cn(
              "text-xs font-medium",
              item.is_public ? "text-emerald-400" : "text-white/50"
            )}>
              {item.is_public ? '공개' : '비공개'}
            </span>
          </motion.button>
        )}
      </div>

      {/* Image with BBox */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-full">
          <img
            ref={imageRef}
            src={item.uploaded_image_url}
            alt="Feed item"
            className="max-w-full max-h-[55vh] rounded-2xl object-contain"
            onLoad={() => setImageLoaded(true)}
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          />

          {/* BBox Overlays */}
          {imageLoaded && imageSize.width > 0 && objectsWithBBox.map((obj, idx) => {
            const bbox = obj.bbox!;
            const isSelected = selectedObjectId === obj.id;

            const left = bbox.x1 * imageSize.width;
            const top = bbox.y1 * imageSize.height;
            const width = (bbox.x2 - bbox.x1) * imageSize.width;
            const height = (bbox.y2 - bbox.y1) * imageSize.height;

            return (
              <motion.div
                key={obj.id}
                className="absolute cursor-pointer"
                style={{ left, top, width, height }}
                onClick={(e) => handleBBoxClick(e, obj.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isActive ? 1 : 0.5, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    border: isSelected
                      ? '3px solid rgba(255, 255, 255, 0.95)'
                      : '2px solid rgba(255, 255, 255, 0.5)',
                    background: isSelected
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    boxShadow: isSelected
                      ? '0 0 30px rgba(255, 255, 255, 0.4)'
                      : '0 0 15px rgba(255, 255, 255, 0.2)',
                  }}
                  animate={{ scale: isSelected ? 1.02 : 1 }}
                  transition={springs.snappy}
                />

                {/* Index Badge */}
                <motion.div
                  className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: isSelected ? 'white' : 'rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  <span className="text-[10px] font-bold text-black">{idx + 1}</span>
                </motion.div>

                {/* Category Label */}
                <div
                  className="absolute bottom-2 left-2 px-2 py-1 rounded-full"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span className="text-[10px] text-white font-medium">{obj.category}</span>
                </div>

                {/* Pulse */}
                {!isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-white/40"
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.01, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tap hint */}
        {!selectedObjectId && objectsWithBBox.length > 0 && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <p className="text-white/70 text-xs">아이템을 탭하여 상품 정보 확인</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Panel */}
      <AnimatePresence>
        {selectedObject && selectedProduct && (
          <motion.div
            className="bg-zinc-900 rounded-t-3xl border-t border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.snappy}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>

            <div className="px-4 pb-6">
              <div className="flex gap-4">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.product_name}
                  className="w-24 h-32 object-cover rounded-xl"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    {selectedProduct.brand_name}
                  </p>
                  <h4
                    className="text-sm text-white font-medium line-clamp-2 mt-1 cursor-pointer hover:underline"
                    onClick={() => {
                      if (selectedProduct.product_url) {
                        window.open(selectedProduct.product_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {selectedProduct.product_name}
                  </h4>
                  <p className="text-lg text-white font-bold mt-2">
                    ₩{selectedProduct.selling_price?.toLocaleString()}
                  </p>

                  {/* Size Selector */}
                  {availableSizes.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] text-white/50 mb-2">사이즈 선택</p>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <motion.button
                            key={size.size_code_id}
                            onClick={() => setSelectedSizeCodeId(size.size_code_id)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                              selectedSizeCodeId === size.size_code_id
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            )}
                            whileTap={{ scale: 0.95 }}
                          >
                            {size.size_value}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={(availableSizes.length > 0 && !selectedSizeCodeId) || isAddingToCart}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2",
                    (availableSizes.length > 0 && !selectedSizeCodeId) || isAddingToCart
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-white/15 text-white border border-white/20 hover:bg-white/25'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isAddingToCart ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <ShoppingBag size={16} />
                  )}
                  장바구니
                </motion.button>
                <motion.button
                  onClick={handlePurchase}
                  disabled={(availableSizes.length > 0 && !selectedSizeCodeId) || isPurchasing}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2",
                    (availableSizes.length > 0 && !selectedSizeCodeId) || isPurchasing
                      ? 'bg-white/20 text-white/40 cursor-not-allowed'
                      : 'bg-white text-black'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPurchasing ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <Package size={16} />
                  )}
                  {availableSizes.length > 0 && !selectedSizeCodeId ? '사이즈 선택' : '구매하기'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Products State */}
      {(!item.detected_objects || item.detected_objects.length === 0) && (
        <div className="p-6 text-center">
          <p className="text-white/40 text-sm">감지된 아이템이 없습니다</p>
        </div>
      )}
    </div>
  );
}

// Distribute items into columns evenly (like Pinterest)
function distributeIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });
  return columns;
}

// Main Pinterest Feed Component
export function PinterestFeed({ className }: PinterestFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [columnCount, setColumnCount] = useState(2);

  // Update column count based on screen width
  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth >= 1024) {
        setColumnCount(4); // lg
      } else if (window.innerWidth >= 768) {
        setColumnCount(3); // md
      } else {
        setColumnCount(2); // default
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Fetch items
  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = activeTab === 'discover'
        ? await feedApi.getPublicFeed({ limit: 30 })
        : await feedApi.getMyHistory({ limit: 30 });
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Visibility toggle handler
  const handleVisibilityToggle = async (itemId: number, isPublic: boolean) => {
    try {
      await feedApi.toggleVisibility(itemId, { is_public: isPublic });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_public: isPublic } : item
        )
      );
      toast.success(isPublic ? '공개로 변경되었습니다' : '비공개로 변경되었습니다');
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('변경에 실패했습니다');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Header */}
      <div className="sticky top-0 z-20 py-6 px-4 bg-gradient-to-b from-black via-black to-transparent">
        <div
          className="flex items-center justify-center gap-1 p-1.5 rounded-2xl max-w-xs mx-auto"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {(['discover', 'history'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors",
                activeTab === tab ? "text-black" : "text-white/40 hover:text-white/70"
              )}
              whileTap={{ scale: 0.95 }}
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-xl"
                  layoutId="pinterestTabBg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative flex items-center justify-center gap-1.5">
                {tab === 'discover' ? (
                  <>
                    <Globe size={14} />
                    <span>Discover</span>
                  </>
                ) : (
                  <>
                    <Heart size={14} />
                    <span>History</span>
                  </>
                )}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Pinterest Grid */}
      <div className="px-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <motion.div
              className="w-10 h-10 rounded-full"
              style={{
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'rgba(255,255,255,0.6)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {activeTab === 'discover' ? (
                <Globe size={32} className="text-white/15" />
              ) : (
                <Heart size={32} className="text-white/15" />
              )}
            </div>
            <p className="text-white/30 text-sm">
              {activeTab === 'discover'
                ? '공개된 스타일이 없습니다'
                : '분석한 이미지가 없습니다'}
            </p>
          </motion.div>
        ) : (
          <div className="flex gap-4">
            {distributeIntoColumns(items, columnCount).map((columnItems, colIndex) => (
              <div key={colIndex} className="flex-1 flex flex-col gap-4">
                {columnItems.map((item) => {
                  // Find original index for expanded view
                  const originalIndex = items.findIndex((i) => i.id === item.id);
                  return (
                    <PinterestCard
                      key={item.id}
                      item={item}
                      isOwn={activeTab === 'history'}
                      onClick={() => {
                        haptic('tap');
                        setExpandedIndex(originalIndex);
                      }}
                      onVisibilityToggle={
                        activeTab === 'history'
                          ? (isPublic) => handleVisibilityToggle(item.id, isPublic)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded View */}
      <AnimatePresence>
        {expandedIndex !== null && items.length > 0 && (
          <ExpandedPostView
            items={items}
            initialIndex={expandedIndex}
            isOwn={activeTab === 'history'}
            onClose={() => setExpandedIndex(null)}
            onVisibilityToggle={handleVisibilityToggle}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
