import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SuggestionChip {
  id: string;
  label: string;
  icon?: string;
}

interface AgentSuggestionProps {
  suggestions: SuggestionChip[];
  onSelect: (id: string) => void;
  className?: string;
}

export function AgentSuggestion({
  suggestions,
  onSelect,
  className,
}: AgentSuggestionProps) {
  return (
    <motion.div
      className={cn('flex flex-wrap gap-2', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={suggestion.id}
          onClick={() => onSelect(suggestion.id)}
          className={cn(
            'px-4 py-2.5 rounded-full',
            'bg-white/5 border border-white/10',
            'text-sm text-white/80',
            'hover:bg-white/10 hover:border-white/20',
            'transition-all duration-200',
            'flex items-center gap-2'
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {suggestion.icon && <span>{suggestion.icon}</span>}
          <span>{suggestion.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
}

interface AgentQuickActionsProps {
  actions: QuickAction[];
  onSelect: (id: string) => void;
  className?: string;
}

export function AgentQuickActions({
  actions,
  onSelect,
  className,
}: AgentQuickActionsProps) {
  return (
    <motion.div
      className={cn('grid grid-cols-2 gap-3', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {actions.map((action, i) => (
        <motion.button
          key={action.id}
          onClick={() => onSelect(action.id)}
          className={cn(
            'glass rounded-xl p-4',
            'flex flex-col items-start gap-2',
            'hover:bg-white/[0.04] transition-colors'
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            {action.icon}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white/90">{action.label}</p>
            {action.description && (
              <p className="text-xs text-white/40 mt-0.5">{action.description}</p>
            )}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
