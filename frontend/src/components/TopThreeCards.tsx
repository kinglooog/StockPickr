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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {top3.map((topic, idx) => (
        <Link
          key={topic.id}
          to={`/topic/${topic.id}`}
          className="group relative bg-bg-card border border-border rounded-xl p-5
                     hover:border-accent-gold/30 hover:bg-bg-hover
                     transition-all duration-300 animate-fade-in-up"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-accent-gold/50 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-start justify-between mb-3">
            <HeatBadge rank={topic.heat_rank} size="lg" />
            {topic.up_down_pct != null && (
              <span
                className={`font-data text-lg font-semibold ${
                  topic.up_down_pct >= 0 ? 'text-up-red' : 'text-down-green'
                }`}
              >
                {topic.up_down_pct >= 0 ? '+' : ''}
                {topic.up_down_pct.toFixed(2)}%
              </span>
            )}
          </div>

          <h3 className="font-display text-lg font-semibold text-text-primary mb-2
                        group-hover:text-accent-gold transition-colors">
            {topic.name}
          </h3>

          {topic.leading_stock && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">领涨</span>
              <span className="font-data text-up-red">{topic.leading_stock}</span>
            </div>
          )}

          {/* Hover glow */}
          <div className="absolute inset-0 rounded-xl bg-accent-gold/5 opacity-0
                          group-hover:opacity-100 transition-opacity pointer-events-none" />
        </Link>
      ))}
    </div>
  )
}
