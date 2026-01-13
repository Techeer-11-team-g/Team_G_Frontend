interface AnimatedBackgroundProps {
  variant?: 'default' | 'subtle';
}

export function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  const opacity = variant === 'subtle' ? '20' : '30';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-200/${opacity} to-pink-200/${opacity} blur-3xl`}
      />
      <div
        className={`absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-200/${opacity} to-cyan-200/${opacity} blur-3xl`}
        style={{ animationDelay: '1s' }}
      />
    </div>
  );
}
