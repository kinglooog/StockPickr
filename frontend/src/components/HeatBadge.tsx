interface HeatBadgeProps {
  rank: number
  size?: 'sm' | 'md' | 'lg'
}

const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function HeatBadge({ rank, size = 'md' }: HeatBadgeProps) {
  const sizeMap = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  const isMedal = rank <= 3

  return (
    <div
      className={`
        ${sizeMap[size]} rounded-lg flex items-center justify-center font-data font-semibold
        ${isMedal
          ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30'
          : 'bg-bg-hover text-text-secondary border border-border'
        }
      `}
    >
      {isMedal ? medals[rank] : rank}
    </div>
  )
}
