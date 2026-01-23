import { Camera, Sparkles, Search, Shirt, ShoppingBag } from 'lucide-react';
import type { WorkflowDetail } from './types';

export const WORKFLOW_DETAILS: WorkflowDetail[] = [
  {
    id: 'upload',
    step: 1,
    icon: Camera,
    title: 'Upload Your Look',
    subtitle: 'Start with any outfit photo',
    description: 'Drag and drop or tap to upload any fashion image. Street style, magazine, or your own outfit.',
    features: ['Drag & drop support', 'Mobile camera capture', 'Any fashion image'],
  },
  {
    id: 'analyze',
    step: 2,
    icon: Sparkles,
    title: 'AI Analysis',
    subtitle: 'Intelligent item detection',
    description: 'Our AI scans the image and identifies individual clothing items with precise boundaries.',
    features: ['Multi-item detection', 'Style classification', 'Color extraction'],
  },
  {
    id: 'search',
    step: 3,
    icon: Search,
    title: 'Find Matches',
    subtitle: 'Discover similar products',
    description: 'Browse through curated matches ranked by visual similarity across thousands of products.',
    features: ['Visual similarity search', 'Price range filtering', 'Brand diversity'],
  },
  {
    id: 'tryon',
    step: 4,
    icon: Shirt,
    title: 'Virtual Try-On',
    subtitle: 'See it on yourself',
    description: 'Upload your photo and see how each item looks on you before making a decision.',
    features: ['AI-powered fitting', 'Realistic rendering', 'Multiple angles'],
  },
  {
    id: 'purchase',
    step: 5,
    icon: ShoppingBag,
    title: 'Shop Confidently',
    subtitle: 'Complete your purchase',
    description: 'Add items to cart and checkout seamlessly. Your style journey, simplified.',
    features: ['Secure checkout', 'Size recommendations', 'Order tracking'],
  },
];
