import { useState } from 'react'
import Navbar from '../components/Navbar'
import TopThreeCards from '../components/TopThreeCards'
import TopicRow from '../components/TopicRow'
import { useHotTopics, useTopicList } from '../hooks/useTopics'

export default function HomePage() {
  const [page, setPage] = useState(1)
  const { data: hotTopics, isLoading: hotLoading } = useHotTopics(10)
  const { data: topicList, isLoading: listLoading } = useTopicList(page, 20)

  const topics = topicList?.topics ?? []
  const hot = hotTopics ?? []
  const total = topicList?.total ?? 0
  const pageSize = topicList?.page_size ?? 20
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero section */}
        <section className="mb-10">
          <h1 className="font-display text-3xl font-semibold text-text-primary mb-2">
            热点题材
          </h1>
          <p className="text-text-secondary text-sm">
            A股市场今日热门概念板块，AI 产业链逻辑深度拆解
          </p>
        </section>

        {/* Loading state */}
        {(hotLoading || listLoading) && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 bg-bg-card rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {/* Top 3 cards */}
        {!hotLoading && hot.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-1 rounded-full bg-accent-gold" />
              <h2 className="font-display text-lg font-medium text-text-primary">
                今日最热 TOP 3
              </h2>
            </div>
            <TopThreeCards topics={hot} />
          </>
        )}

        {/* Full ranked list */}
        {!listLoading && topics.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4 mt-8">
              <div className="h-5 w-1 rounded-full bg-text-secondary" />
              <h2 className="font-display text-lg font-medium text-text-primary">
                题材热度榜
              </h2>
              <span className="text-text-secondary text-sm ml-2">
                共 {total} 个题材
              </span>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              {topics.map((topic, idx) => (
                <TopicRow key={topic.id} topic={topic} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary
                             hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors text-sm"
                >
                  上一页
                </button>
                <span className="text-sm text-text-secondary font-data">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-text-secondary
                             hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed
                             transition-colors text-sm"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!hotLoading && !listLoading && hot.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-card border border-border
                           flex items-center justify-center">
              <svg className="w-8 h-8 text-text-secondary" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-medium text-text-primary mb-2">
              暂无数据
            </h3>
            <p className="text-text-secondary text-sm">
              请先触发数据刷新，或等待每日自动更新（收盘后 16:00）
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
