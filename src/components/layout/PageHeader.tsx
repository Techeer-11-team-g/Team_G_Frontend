import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightContent,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky w-full border-b border-black/5 bg-background/90 px-6 py-4 backdrop-blur-xl',
        className
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em]">{title}</h2>
          {subtitle && <p className="mt-1 text-[9px] text-black/40">{subtitle}</p>}
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
