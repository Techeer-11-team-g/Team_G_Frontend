import type { FeedItem, UserProfile, ChatProduct, FeedDetectedObject, FeedProductSize } from '@/types/api';

// Polling constants
export const POLLING_INTERVAL = 3000;
export const MAX_POLLING_ATTEMPTS = 20;

export interface ExpandedPostProps {
  item: FeedItem;
  isOwn: boolean;
  isActive: boolean;
  onVisibilityToggle: (itemId: number, isPublic: boolean) => Promise<void>;
  onProductPanelChange: (isOpen: boolean) => void;
  user: UserProfile | null;
}

export interface ChatState {
  chatInput: string;
  agentMessage: string;
  isChatLoading: boolean;
  chatSessionId: string | null;
  chatProducts: ChatProduct[];
  showChatResults: boolean;
  fittingImageUrl: string | null;
  keyboardHeight: number;
}

export interface ChatProductPanelState {
  selectedChatProduct: ChatProduct | null;
  selectedChatSize: string | null;
  isChatAddingToCart: boolean;
  isChatPurchasing: boolean;
  isChatFitting: boolean;
  isReSearching: boolean;
}

export interface ProductPanelState {
  selectedObjectId: number | null;
  selectedSizeCodeId: number | null;
  isToggling: boolean;
  isAddingToCart: boolean;
  isPurchasing: boolean;
  isFitting: boolean;
}

export interface ImageState {
  imageLoaded: boolean;
  imageSize: { width: number; height: number };
}

export interface ProductPanelProps {
  selectedObject: FeedDetectedObject | undefined;
  selectedProduct: FeedDetectedObject['matched_product'] | undefined;
  availableSizes: FeedProductSize[];
  selectedSizeCodeId: number | null;
  isAddingToCart: boolean;
  isPurchasing: boolean;
  isFitting: boolean;
  onClose: () => void;
  onSizeSelect: (sizeCodeId: number) => void;
  onAddToCart: () => void;
  onPurchase: () => void;
  onFitting: () => void;
}

export interface ChatProductPanelProps {
  selectedChatProduct: ChatProduct | null;
  chatProductSizes: string[];
  selectedChatSize: string | null;
  isChatAddingToCart: boolean;
  isChatPurchasing: boolean;
  isChatFitting: boolean;
  onClose: () => void;
  onSizeSelect: (size: string) => void;
  onAddToCart: () => void;
  onPurchase: () => void;
  onFitting: () => void;
}

export interface DetectedObjectsProps {
  objectsWithBBox: FeedDetectedObject[];
  selectedObjectId: number | null;
  isActive: boolean;
  imageSize: { width: number; height: number };
  imageLoaded: boolean;
  onBBoxClick: (e: React.MouseEvent, objectId: number) => void;
}

export interface ChatInputSectionProps {
  chatInput: string;
  agentMessage: string;
  isChatLoading: boolean;
  isChatFitting: boolean;
  isReSearching: boolean;
  showChatResults: boolean;
  fittingImageUrl: string | null;
  chatProducts: ChatProduct[];
  keyboardHeight: number;
  onChatInputChange: (value: string) => void;
  onChatSubmit: () => void;
  onAgentMessageDismiss: () => void;
  onFittingImageDismiss: () => void;
  onChatResultsDismiss: () => void;
  onChatProductSelect: (product: ChatProduct) => void;
  onReSearch: () => void;
}

export interface FittingResultProps {
  fittingImageUrl: string;
  onDismiss: () => void;
}

export interface ChatResultsProps {
  chatProducts: ChatProduct[];
  onProductSelect: (product: ChatProduct) => void;
  onDismiss: () => void;
}
