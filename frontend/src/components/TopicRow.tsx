import { Link } from 'react-router-dom'
import type { TopicBrief } from '../api/client'
import HeatBadge from './HeatBadge'

interface Props {
  topic: TopicBrief
  index: number
}

export default function TopicRow({ topic, index }: Props) {
  return (
    <Link
      to={`/topic/${topic.id}`}
      className="group flex items-center gap-5 px-5 py-4 bg-bg-card border-b border-border
                 hover:bg-bg-hover transition-colors animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <HeatBadge rank={topic.heat_rank} />

      <div className="flex-1 min-w-0">
        <h4 className="font-display text-base font-medium text-text-primary
                      group-hover:text-accent-gold transition-colors truncate">
          {topic.name}
        </h4>
      </div>

      {topic.leading_stock && (
        <span className="text-sm text-text-secondary font-data hidden sm:block">
          {topic.leading_stock}
        </span>
      )}

      {topic.up_down_pct != null && (
        <span
          className={`font-data text-sm font-semibold min-w-[70px] text-right ${
            topic.up_down_pct >= 0 ? 'text-up-red' : 'text-down-green'
          }`}
        >
          {topic.up_down_pct >= 0 ? '+' : ''}
          {topic.up_down_pct.toFixed(2)}%
        </span>
      )}

      <svg
        className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100
                   -translate-x-2 group-hover:translate-x-0 transition-all shrink-0"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  )
}
