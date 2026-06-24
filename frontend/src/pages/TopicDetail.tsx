import { Link, useParams } from 'react-router-dom'
import { useTopicDetail } from '../hooks/useTopics'
import IndustryChainFlow from '../components/IndustryChainFlow'
import StockTable from '../components/StockTable'

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: topic, isLoading, error } = useTopicDetail(id ?? '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="h-8 w-32 bg-bg-card rounded animate-pulse mb-8" />
          <div className="h-48 bg-bg-card rounded-xl animate-pulse mb-6" />
          <div className="h-64 bg-bg-card rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-xl text-text-primary mb-2">题材未找到</h2>
          <Link to="/" className="text-accent-gold hover:underline text-sm">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const isUp = (topic.up_down_pct ?? 0) >= 0

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="border-b border-border bg-bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary
                       transition-colors text-sm mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            返回列表
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-text-primary">
                {topic.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-data text-xs text-text-secondary bg-bg-hover px-2 py-0.5 rounded">
                  {topic.code}
                </span>
                {topic.leading_stock && (
                  <span className="text-sm text-text-secondary">
                    领涨：<span className="font-data text-up-red">{topic.leading_stock}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`font-data text-3xl font-bold ${isUp ? 'text-up-red' : 'text-down-green'}`}>
                  {isUp ? '+' : ''}{topic.up_down_pct?.toFixed(2) ?? '—'}%
                </div>
                <div className="text-xs text-text-secondary mt-1">今日涨跌幅</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="font-data text-xl font-semibold text-accent-gold">
                  #{topic.heat_rank}
                </div>
                <div className="text-xs text-text-secondary mt-1">热度排名</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Concept explanation */}
        {topic.concept_explanation && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-1 rounded-full bg-accent-gold" />
              <h2 className="font-display text-lg font-medium text-text-primary">题材概念</h2>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <p className="text-text-primary leading-relaxed text-[15px]">
                {topic.concept_explanation}
              </p>
            </div>
          </section>
        )}

        {/* Industry chain flow (signature element) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-1 rounded-full bg-accent-gold" />
            <h2 className="font-display text-lg font-medium text-text-primary">产业链逻辑</h2>
          </div>
          <IndustryChainFlow
            upstream={topic.upstream_stocks}
            midstream={topic.midstream_stocks}
            downstream={topic.downstream_stocks}
            upstreamDesc={topic.upstream_desc}
            midstreamDesc={topic.midstream_desc}
            downstreamDesc={topic.downstream_desc}
          />
        </section>

        {/* Stock tables by chain level */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-1 rounded-full bg-accent-gold" />
            <h2 className="font-display text-lg font-medium text-text-primary">核心标的</h2>
          </div>
          <StockTable stocks={topic.upstream_stocks} levelColor="#5B9BD5" title="上游 · 原材料与零部件" />
          <StockTable stocks={topic.midstream_stocks} levelColor="#C5A35A" title="中游 · 制造与集成" />
          <StockTable stocks={topic.downstream_stocks} levelColor="#E0854B" title="下游 · 应用与运营" />
        </section>

        {/* Meta */}
        <div className="text-xs text-text-secondary pt-4 border-t border-border">
          数据更新于 {new Date(topic.created_at).toLocaleString('zh-CN', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'})} · AI 生成内容仅供参考，不构成投资建议
        </div>
      </div>
    </div>
  )
}
