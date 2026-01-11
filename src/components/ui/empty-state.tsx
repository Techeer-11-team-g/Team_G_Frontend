import type { ReactNode } from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ message, icon, title, description, action }: EmptyStateProps) {
  // Simple message-only version
  if (message && !icon && !title) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-black/5 rounded-4xl">
        <p className="text-[11px] uppercase font-black text-black/20">{message}</p>
      </div>
    );
  }

  // Full version with icon, title, description, action
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
      {icon && (
        <div className="text-black/20">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-[14px] font-bold text-black/60">{title}</h3>
      )}
      {description && (
        <p className="text-[11px] text-black/40">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
