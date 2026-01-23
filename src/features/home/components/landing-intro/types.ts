import type { LucideIcon } from 'lucide-react';

export interface WorkflowStep {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export interface WorkflowDetail {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export interface FeaturePointProps {
  icon: LucideIcon;
  text: string;
}
