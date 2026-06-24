import type { StockOut } from '../api/client'

interface Props {
  upstream: StockOut[]
  midstream: StockOut[]
  downstream: StockOut[]
  upstreamDesc?: string | null
  midstreamDesc?: string | null
  downstreamDesc?: string | null
}

const NODE_COLORS = {
  upstream: { bg: '#5B9BD5', text: '#E8E4DD', label: '上游' },
  midstream: { bg: '#C5A35A', text: '#080C16', label: '中游' },
  downstream: { bg: '#E0854B', text: '#080C16', label: '下游' },
} as const

function ParticleDot({ delay, y, color }: { delay: number; y: number; color: string }) {
  return (
    <circle
      cx="0" cy={y} r="2.5"
      fill={color}
      className="animate-flow"
      style={{ animationDelay: `${delay}s`, animationDuration: `${2 + delay * 0.5}s` }}
    >
      <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + delay * 0.5}s`} repeatCount="indefinite" begin={`${delay}s`} />
    </circle>
  )
}

export default function IndustryChainFlow({
  upstream, midstream, downstream,
  upstreamDesc, midstreamDesc, downstreamDesc,
}: Props) {
  const hasData = upstream.length > 0 || midstream.length > 0 || downstream.length > 0
  if (!hasData) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-8 text-center text-text-secondary">
        产业链数据生成中...
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 overflow-hidden">
      {/* Flow diagram */}
      <div className="relative mb-6 overflow-x-auto">
        <svg
          viewBox="0 0 800 160"
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection lines between nodes */}
          <defs>
            <linearGradient id="line-up-mid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B9BD5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C5A35A" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="line-mid-down" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A35A" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E0854B" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connecting bands */}
          <line x1="260" y1="80" x2="360" y2="80" stroke="url(#line-up-mid)" strokeWidth="3" strokeDasharray="8,4" />
          <line x1="540" y1="80" x2="640" y2="80" stroke="url(#line-mid-down)" strokeWidth="3" strokeDasharray="8,4" />

          {/* Arrow heads */}
          <polygon points="355,75 365,80 355,85" fill="#C5A35A" opacity="0.6" />
          <polygon points="635,75 645,80 635,85" fill="#E0854B" opacity="0.6" />

          {/* Upstream node */}
          <g filter="url(#glow)">
            <rect x="80" y="20" width="180" height="120" rx="12"
              fill="#5B9BD5" fillOpacity="0.1" stroke="#5B9BD5" strokeOpacity="0.3" strokeWidth="1" />
            <text x="170" y="55" textAnchor="middle" fill="#E8E4DD" fontSize="16" fontWeight="600" fontFamily="Noto Serif SC, serif">
              上游
            </text>
            <text x="170" y="78" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">
              原材料 · 零部件
            </text>
            <text x="170" y="100" textAnchor="middle" fill="#5B9BD5" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="500">
              {upstream.length} 只标的
            </text>
          </g>

          {/* Midstream node */}
          <g filter="url(#glow)">
            <rect x="360" y="20" width="180" height="120" rx="12"
              fill="#C5A35A" fillOpacity="0.1" stroke="#C5A35A" strokeOpacity="0.3" strokeWidth="1" />
            <text x="450" y="55" textAnchor="middle" fill="#E8E4DD" fontSize="16" fontWeight="600" fontFamily="Noto Serif SC, serif">
              中游
            </text>
            <text x="450" y="78" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">
              制造 · 集成
            </text>
            <text x="450" y="100" textAnchor="middle" fill="#C5A35A" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="500">
              {midstream.length} 只标的
            </text>
          </g>

          {/* Downstream node */}
          <g filter="url(#glow)">
            <rect x="640" y="20" width="180" height="120" rx="12"
              fill="#E0854B" fillOpacity="0.1" stroke="#E0854B" strokeOpacity="0.3" strokeWidth="1" />
            <text x="730" y="55" textAnchor="middle" fill="#E8E4DD" fontSize="16" fontWeight="600" fontFamily="Noto Serif SC, serif">
              下游
            </text>
            <text x="730" y="78" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">
              应用 · 运营
            </text>
            <text x="730" y="100" textAnchor="middle" fill="#E0854B" fontSize="12" fontFamily="JetBrains Mono, monospace" fontWeight="500">
              {downstream.length} 只标的
            </text>
          </g>

          {/* Flow particles */}
          <g>
            {[0, 1, 2].map(i => (
              <ParticleDot key={`up-mid-${i}`} delay={i * 0.8} y={80} color="#5B9BD5" />
            ))}
          </g>
        </svg>
      </div>

      {/* Chain descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="border-l-2 border-chain-up pl-3">
          <div className="font-medium text-chain-up mb-1">上游</div>
          <p className="text-text-secondary leading-relaxed text-xs">
            {upstreamDesc || '暂无上游分析'}
          </p>
        </div>
        <div className="border-l-2 border-chain-mid pl-3">
          <div className="font-medium text-chain-mid mb-1">中游</div>
          <p className="text-text-secondary leading-relaxed text-xs">
            {midstreamDesc || '暂无中游分析'}
          </p>
        </div>
        <div className="border-l-2 border-chain-down pl-3">
          <div className="font-medium text-chain-down mb-1">下游</div>
          <p className="text-text-secondary leading-relaxed text-xs">
            {downstreamDesc || '暂无下游分析'}
          </p>
        </div>
      </div>
    </div>
  )
}
