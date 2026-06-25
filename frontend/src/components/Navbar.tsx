import { Link } from 'react-router-dom'

export default function Navbar() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <nav className="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur border-b border-border">
      <div className="max-w-[1400px] mx-auto px-5 h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-accent-gold/15 border border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold/25 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              className="text-accent-gold" strokeWidth="2" strokeLinecap="round">
              <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
              <polyline points="16,7 22,7 22,13" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold text-text-primary tracking-tight">
            股灵智选
          </span>
          <span className="text-text-secondary text-sm font-body ml-1">· 热点题材</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-text-secondary text-sm font-data">
            {today}
          </span>
          <div className="h-4 w-px bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-down-green animate-pulse" />
            <span className="text-xs text-text-secondary">数据更新中</span>
          </span>
        </div>
      </div>
    </nav>
  )
}
