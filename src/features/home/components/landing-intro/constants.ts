import { Camera, Sparkles, Search, Shirt, ShoppingBag } from 'lucide-react';
import type { WorkflowStep, WorkflowDetail } from './types';

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { icon: Camera, title: 'Upload', subtitle: 'Drop your outfit' },
  { icon: Sparkles, title: 'Analyze', subtitle: 'AI detects items' },
  { icon: Search, title: 'Match', subtitle: 'Find similar' },
  { icon: Shirt, title: 'Try On', subtitle: 'Virtual fitting' },
  { icon: ShoppingBag, title: 'Shop', subtitle: 'Buy with ease' },
];

export const WORKFLOW_DETAILS: WorkflowDetail[] = [
  {
    id: 'upload',
    step: 1,
    icon: Camera,
    title: 'Upload Your Look',
    description: 'Drag and drop or tap to upload any fashion image. Street style, magazine, or your own outfit.',
    features: ['Drag & drop', 'Camera capture', 'Any image'],
  },
  {
    id: 'analyze',
    step: 2,
    icon: Sparkles,
    title: 'AI Analysis',
    description: 'Our AI scans the image and identifies individual clothing items with precise boundaries.',
    features: ['Multi-item detection', 'Style classification', 'Color extraction'],
  },
  {
    id: 'search',
    step: 3,
    icon: Search,
    title: 'Find Matches',
    description: 'Browse curated matches ranked by visual similarity across thousands of products.',
    features: ['Visual similarity', 'Price filtering', 'Brand variety'],
  },
  {
    id: 'tryon',
    step: 4,
    icon: Shirt,
    title: 'Virtual Try-On',
    description: 'Upload your photo and see how each item looks on you before making a decision.',
    features: ['AI fitting', 'Realistic render', 'Quick preview'],
  },
  {
    id: 'purchase',
    step: 5,
    icon: ShoppingBag,
    title: 'Shop Confidently',
    description: 'Add items to cart and checkout seamlessly. Your style journey, simplified.',
    features: ['Secure checkout', 'Size guide', 'Order tracking'],
  },
];
