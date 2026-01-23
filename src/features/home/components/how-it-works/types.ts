import type { LucideIcon } from 'lucide-react';

export interface WorkflowDetail {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

export interface WorkflowCardProps {
  detail: WorkflowDetail;
  index: number;
  isInView: boolean;
  isActive: boolean;
  onHover: () => void;
  onLeave: () => void;
}

export interface MobileWorkflowCardProps {
  detail: WorkflowDetail;
  index: number;
  isInView: boolean;
  isLast: boolean;
}
