import type { StockOut } from '../api/client'

interface Props {
  stocks: StockOut[]
  levelColor: string
  title: string
}

export default function StockTable({ stocks, levelColor, title }: Props) {
  if (stocks.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 mb-4">
        <h4 className="font-display text-base font-medium mb-3" style={{ color: levelColor }}>
          {title}
        </h4>
        <p className="text-text-secondary text-sm">暂无该环节标的</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-4">
      <div
        className="px-5 py-3 border-b font-display text-base font-medium"
        style={{ borderColor: 'var(--color-border)', color: levelColor }}
      >
        {title}
        <span className="ml-2 text-xs text-text-secondary font-body">
          {stocks.length} 只标的
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-text-secondary uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">代码</th>
              <th className="text-left px-5 py-3 font-medium">名称</th>
              <th className="text-left px-5 py-3 font-medium max-w-md">入选逻辑</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => (
              <tr
                key={stock.id}
                className="border-b border-border/50 last:border-0
                           hover:bg-bg-hover transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="px-5 py-3.5">
                  <span className="font-data text-sm text-text-secondary">{stock.code}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="font-display text-sm font-medium text-text-primary">
                    {stock.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 max-w-md">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {stock.logic || '暂无逻辑分析'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
