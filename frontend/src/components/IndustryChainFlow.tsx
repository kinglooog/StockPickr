import type { StockOut } from '../api/client'

interface Props {
  upstream: StockOut[]
  midstream: StockOut[]
  downstream: StockOut[]
  upstreamDesc?: string | null
  midstreamDesc?: string | null
  downstreamDesc?: string | null
}

export default function IndustryChainFlow({
  upstream, midstream, downstream,
  upstreamDesc, midstreamDesc, downstreamDesc,
}: Props) {
  const hasData = upstream.length > 0 || midstream.length > 0 || downstream.length > 0
  if (!hasData) {
    return (
      <div className="bg-bg-card border border-border rounded-lg p-6 text-center text-text-secondary text-sm">
        产业链数据生成中...
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-lg py-5 px-4 overflow-hidden">
      {/* Flow diagram — responsive SVG, wider viewBox so all 3 nodes fit */}
      <div className="mb-5">
        <svg
          viewBox="0 0 900 130"
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="lu" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5B9BD5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C5A35A" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="lm" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C5A35A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E0854B" stopOpacity="0.5" />
            </linearGradient>
            <filter id="g">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Connecting lines */}
          <line x1="260" y1="65" x2="350" y2="65" stroke="url(#lu)" strokeWidth="2.5" strokeDasharray="6,4" />
          <line x1="550" y1="65" x2="640" y2="65" stroke="url(#lm)" strokeWidth="2.5" strokeDasharray="6,4" />
          <polygon points="347,60 357,65 347,70" fill="#C5A35A" opacity="0.5" />
          <polygon points="637,60 647,65 637,70" fill="#E0854B" opacity="0.5" />

          {/* Upstream */}
          <g filter="url(#g)">
            <rect x="40" y="10" width="220" height="110" rx="10"
              fill="#5B9BD5" fillOpacity="0.08" stroke="#5B9BD5" strokeOpacity="0.25" strokeWidth="1" />
            <text x="150" y="45" textAnchor="middle" fill="#E8E4DD" fontSize="17" fontWeight="600" fontFamily="Noto Serif SC, serif">上游</text>
            <text x="150" y="66" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">原材料 · 零部件</text>
            <text x="150" y="90" textAnchor="middle" fill="#5B9BD5" fontSize="13" fontFamily="JetBrains Mono, monospace" fontWeight="500">{upstream.length} 只标的</text>
          </g>

          {/* Midstream */}
          <g filter="url(#g)">
            <rect x="340" y="10" width="220" height="110" rx="10"
              fill="#C5A35A" fillOpacity="0.08" stroke="#C5A35A" strokeOpacity="0.25" strokeWidth="1" />
            <text x="450" y="45" textAnchor="middle" fill="#E8E4DD" fontSize="17" fontWeight="600" fontFamily="Noto Serif SC, serif">中游</text>
            <text x="450" y="66" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">制造 · 集成</text>
            <text x="450" y="90" textAnchor="middle" fill="#C5A35A" fontSize="13" fontFamily="JetBrains Mono, monospace" fontWeight="500">{midstream.length} 只标的</text>
          </g>

          {/* Downstream */}
          <g filter="url(#g)">
            <rect x="640" y="10" width="220" height="110" rx="10"
              fill="#E0854B" fillOpacity="0.08" stroke="#E0854B" strokeOpacity="0.25" strokeWidth="1" />
            <text x="750" y="45" textAnchor="middle" fill="#E8E4DD" fontSize="17" fontWeight="600" fontFamily="Noto Serif SC, serif">下游</text>
            <text x="750" y="66" textAnchor="middle" fill="#8A8D96" fontSize="11" fontFamily="Inter, sans-serif">应用 · 运营</text>
            <text x="750" y="90" textAnchor="middle" fill="#E0854B" fontSize="13" fontFamily="JetBrains Mono, monospace" fontWeight="500">{downstream.length} 只标的</text>
          </g>

          {/* Flow particles */}
          {[0, 1, 2].map(i => (
            <circle key={i} cx="0" cy="65" r="2" fill="#5B9BD5" className="animate-flow"
              style={{ animationDelay: `${i*0.7}s`, animationDuration: `${2+i*0.4}s` }} />
          ))}
        </svg>
      </div>

      {/* Chain descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="border-l-2 border-chain-up pl-3">
          <div className="font-medium text-chain-up mb-1 text-sm">上游</div>
          <p className="text-text-secondary leading-relaxed text-xs">{upstreamDesc || '暂无上游分析'}</p>
        </div>
        <div className="border-l-2 border-chain-mid pl-3">
          <div className="font-medium text-chain-mid mb-1 text-sm">中游</div>
          <p className="text-text-secondary leading-relaxed text-xs">{midstreamDesc || '暂无中游分析'}</p>
        </div>
        <div className="border-l-2 border-chain-down pl-3">
          <div className="font-medium text-chain-down mb-1 text-sm">下游</div>
          <p className="text-text-secondary leading-relaxed text-xs">{downstreamDesc || '暂无下游分析'}</p>
        </div>
      </div>
    </div>
  )
}
