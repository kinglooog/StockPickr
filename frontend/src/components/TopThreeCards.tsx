import { Link } from 'react-router-dom'
import type { TopicBrief } from '../api/client'
import HeatBadge from './HeatBadge'

interface Props {
  topics: TopicBrief[]
}

export default function TopThreeCards({ topics }: Props) {
  const top3 = topics.slice(0, 3)
  if (top3.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {top3.map((topic, idx) => (
        <Link
          key={topic.id}
          to={`/topic/${topic.id}`}
          className="group relative bg-bg-card border border-border rounded-lg p-4
                     hover:border-accent-gold/30 hover:bg-bg-hover
                     transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start justify-between mb-2.5">
            <HeatBadge rank={topic.heat_rank} size="md" />
            {topic.up_down_pct != null && (
              <span className={`font-data text-lg font-semibold ${
                topic.up_down_pct >= 0 ? 'text-up-red' : 'text-down-green'
              }`}>
                {topic.up_down_pct >= 0 ? '+' : ''}{topic.up_down_pct.toFixed(2)}%
              </span>
            )}
          </div>

          <h3 className="font-display text-lg font-semibold text-text-primary mb-1.5
                        group-hover:text-accent-gold transition-colors">
            {topic.name}
          </h3>

          {topic.leading_stock && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-text-secondary">领涨</span>
              <span className="font-data text-up-red">{topic.leading_stock}</span>
            </div>
          )}

          <div className="absolute inset-0 rounded-lg bg-accent-gold/5 opacity-0
                          group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
      ))}
    </div>
  )
}
