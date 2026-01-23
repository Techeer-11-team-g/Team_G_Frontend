import { motion } from 'framer-motion';
import { Search, Shirt, ShoppingBag } from 'lucide-react';
import { cn } from '@/utils/cn';

type SubAgent = 'search' | 'fitting' | 'commerce';

interface OrchestratorViewProps {
  activeAgent?: SubAgent | null;
  className?: string;
}

const agents = [
  {
    id: 'search' as SubAgent,
    label: 'Search',
    description: '스타일 검색',
    icon: Search,
    color: '#4A9DFF',
  },
  {
    id: 'fitting' as SubAgent,
    label: 'Fitting',
    description: '가상 피팅',
    icon: Shirt,
    color: '#EE344A',
  },
  {
    id: 'commerce' as SubAgent,
    label: 'Commerce',
    description: '주문/결제',
    icon: ShoppingBag,
    color: '#00D26A',
  },
];

export function OrchestratorView({
  activeAgent,
  className,
}: OrchestratorViewProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Main Orchestrator */}
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center"
          animate={
            activeAgent
              ? { scale: [1, 1.1, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: '0 0 30px rgba(238, 52, 74, 0.4)',
          }}
        >
          <span className="text-white font-bold text-xl">AI</span>
        </motion.div>
        <p className="mt-2 text-xs text-white/60 font-mono tracking-wider">
          ORCHESTRATOR
        </p>
      </motion.div>

      {/* Connection Lines */}
      <svg
        className="absolute top-16 left-1/2 -translate-x-1/2 w-64 h-16"
        viewBox="0 0 256 64"
      >
        {agents.map((agent, i) => {
          const startX = 128;
          const startY = 0;
          const endX = 32 + i * 96;
          const endY = 64;
          const isActive = activeAgent === agent.id;

          return (
            <motion.path
              key={agent.id}
              d={`M ${startX} ${startY} Q ${startX} ${endY / 2}, ${endX} ${endY}`}
              fill="none"
              stroke={isActive ? agent.color : 'rgba(255,255,255,0.1)'}
              strokeWidth={isActive ? 2 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Sub Agents */}
      <div className="flex justify-around pt-16">
        {agents.map((agent, i) => {
          const Icon = agent.icon;
          const isActive = activeAgent === agent.id;

          return (
            <motion.div
              key={agent.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <motion.div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  'transition-all duration-300'
                )}
                style={{
                  backgroundColor: isActive
                    ? `${agent.color}20`
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive
                    ? `0 0 20px ${agent.color}40`
                    : 'none',
                }}
                animate={
                  isActive
                    ? { scale: [1, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
              >
                <Icon
                  size={20}
                  style={{
                    color: isActive ? agent.color : 'rgba(255,255,255,0.4)',
                  }}
                />
              </motion.div>
              <p
                className={cn(
                  'mt-2 text-[10px] font-mono tracking-wider',
                  isActive ? 'text-white' : 'text-white/40'
                )}
              >
                {agent.label.toUpperCase()}
              </p>
              <p
                className={cn(
                  'text-[9px]',
                  isActive ? 'text-white/60' : 'text-white/20'
                )}
              >
                {agent.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface AgentStatusBadgeProps {
  agent: SubAgent;
  status: 'idle' | 'active' | 'done';
  className?: string;
}

export function AgentStatusBadge({
  agent,
  status,
  className,
}: AgentStatusBadgeProps) {
  const agentInfo = agents.find((a) => a.id === agent);
  if (!agentInfo) return null;

  const Icon = agentInfo.icon;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'border transition-colors',
        status === 'active'
          ? 'border-white/20 bg-white/5'
          : status === 'done'
            ? 'border-success/30 bg-success/10'
            : 'border-white/10 bg-transparent',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Icon
        size={14}
        style={{
          color:
            status === 'done'
              ? '#00D26A'
              : status === 'active'
                ? agentInfo.color
                : 'rgba(255,255,255,0.4)',
        }}
      />
      <span
        className={cn(
          'text-xs font-mono',
          status === 'done'
            ? 'text-success'
            : status === 'active'
              ? 'text-white'
              : 'text-white/40'
        )}
      >
        {agentInfo.label}
      </span>
      {status === 'active' && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: agentInfo.color }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {status === 'done' && <span className="text-success text-xs">✓</span>}
    </motion.div>
  );
}
