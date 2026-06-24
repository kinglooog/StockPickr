import { useState } from 'react'
import Navbar from '../components/Navbar'
import TopThreeCards from '../components/TopThreeCards'
import TopicRow from '../components/TopicRow'
import { useHotTopics, useTopicList, useRefresh } from '../hooks/useTopics'

export default function HomePage() {
  const [page, setPage] = useState(1)
  const { data: hotTopics, isLoading: hotLoading, refetch: refetchHot } = useHotTopics(10)
  const { data: topicList, isLoading: listLoading, refetch: refetchList } = useTopicList(page, 20)
  const { mutate: doRefresh, isPending: refreshing } = useRefresh()

  const handleRefresh = () => {
    doRefresh(undefined, {
      onSuccess: () => {
        refetchHot()
        refetchList()
      },
    })
  }

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold text-text-primary mb-2">
                热点题材
              </h1>
              <p className="text-text-secondary text-sm">
                A股市场今日热门概念板块，AI 产业链逻辑深度拆解
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg
                         bg-accent-gold/10 border border-accent-gold/30
                         text-accent-gold text-sm font-medium
                         hover:bg-accent-gold/20 active:scale-95
                         disabled:opacity-50 disabled:cursor-wait
                         transition-all"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v5h-5" />
              </svg>
              {refreshing ? '抓取中...' : '刷新数据'}
            </button>
          </div>
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
            <p className="text-text-secondary text-sm mb-6">
              点击下方按钮抓取今日热点题材，或等待每日收盘后自动更新
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                         bg-accent-gold text-bg-primary text-sm font-semibold
                         hover:bg-accent-gold/90 active:scale-95
                         disabled:opacity-50 disabled:cursor-wait
                         transition-all shadow-lg shadow-accent-gold/20"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v5h-5" />
              </svg>
              {refreshing ? '正在抓取数据...' : '立即刷新'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
