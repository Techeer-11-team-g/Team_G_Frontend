import { SegmentedControl } from '@/components/ui';

interface ViewModeToggleProps {
  viewMode: 'before' | 'after';
  onChange: (mode: 'before' | 'after') => void;
}

const VIEW_OPTIONS = ['before', 'after'] as const;

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={viewMode}
        onChange={onChange}
        variant="dark"
      />
    </div>
  );
}
