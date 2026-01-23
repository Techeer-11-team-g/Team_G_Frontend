import type { ProductCandidate, ChatProduct } from '@/types/api';
import type { AgentState } from '@/components/agent';

export interface AgentHomePageProps {
  hideHeader?: boolean;
}

export interface AgentHeaderProps {
  cartItemsCount: number;
  onNavigate: (path: string) => void;
}

export interface AgentOrbSectionProps {
  localAgentState: AgentState;
  showParticleBurst: boolean;
  displayedText: string;
  isTyping: boolean;
  isLoading: boolean;
  onOrbClick: () => void;
}

export interface InputSectionProps {
  isInFeedSection: boolean;
  localAgentState: AgentState;
  keyboardHeight: number;
  voiceState: 'idle' | 'listening' | 'processing' | 'error';
  interimTranscript: string;
  textQuery: string;
  pendingImagePreview: string | null;
  products: ProductCandidate[];
  isLoading: boolean;
  isVoiceSupported: boolean;
  onTextQueryChange: (value: string) => void;
  onSubmit: () => void;
  onImageClick: () => void;
  onVoiceClick: () => void;
  onClearPendingImage: () => void;
}

export interface ProductGridProps {
  products: ProductCandidate[];
  previewImage: string | null;
  contentPanelData: {
    isImageAnalysis?: boolean;
    uploadedImageUrl?: string;
    fittingImageUrl?: string;
    fittingProduct?: ChatProduct;
  };
  showFittingResult: boolean;
  onReset: () => void;
  onShowImageAnalysis: () => void;
  onShowFittingResult: () => void;
  onTryOn: (product: ProductCandidate) => void;
  onAddToCart: (index: number, size?: string, qty?: number) => void;
  onBuy: (index: number, size?: string, qty?: number) => void;
}

export interface ImagePreviewProps {
  previewImage: string;
  productsCount: number;
  isImageAnalysis: boolean;
  onShowImageAnalysis: () => void;
  onReset: () => void;
}

export interface FittingPreviewProps {
  fittingImageUrl: string;
  fittingProduct: ChatProduct;
  onShowFittingResult: () => void;
}
