import { motion } from 'framer-motion'
import { tokenSummary, tokenByModel, dailyTokens } from '../token-data'

const easeOut = [0.25, 0.1, 0.25, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function pct(n: number, total: number): string {
  return ((n / total) * 100).toFixed(1) + '%'
}

function formatDate(dateStr: string): string {
  const d = dateStr.split('-')
  return `${d[1]}/${d[2]}`
}

interface BarProps {
  value: number
  max: number
  label: string
  sub: string
}

function DailyBar({ value, max, label, sub }: BarProps) {
  const h = Math.max((value / max) * 100, 8)
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <span className="text-xs font-semibold text-gray-500">{fmt(value)}</span>
      <div className="w-10 h-28 md:w-12 md:h-32 bg-gray-100 rounded-full relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            height: `${h}%`,
            background: 'linear-gradient(180deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
          }}
          initial={{ height: '0%' }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <span className="text-[10px] text-gray-400">{sub}</span>
    </motion.div>
  )
}

export default function TokenDashboard() {
  const maxDaily = Math.max(...dailyTokens.map(d => d.total))

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <motion.div className="max-w-4xl mx-auto space-y-6" variants={stagger} initial="hidden" animate="show">

        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Token 消耗统计</h1>
            <p className="text-sm text-gray-500">过去 7 天（截至 2026-05-09）</p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '总消耗', value: fmt(tokenSummary.totalTokens), sub: `${tokenSummary.totalCalls} 次调用`, color: 'bg-indigo-50 text-indigo-600', bar: 'bg-indigo-500' },
            { label: 'Prompt', value: fmt(tokenSummary.promptTokens), sub: pct(tokenSummary.promptTokens, tokenSummary.totalTokens), color: 'bg-violet-50 text-violet-600', bar: 'bg-violet-500' },
            { label: 'Completion', value: fmt(tokenSummary.completionTokens), sub: pct(tokenSummary.completionTokens, tokenSummary.totalTokens), color: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
            { label: '日均消耗', value: fmt(Math.round(tokenSummary.totalTokens / 7)), sub: `${Math.round(tokenSummary.totalCalls / 7)} 次/天`, color: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              variants={fadeUp}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-3 ${card.color}`}>
                {card.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Daily Trend */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">每日趋势</h2>
          <div className="flex items-end justify-between gap-1 md:gap-2">
            {dailyTokens.map(d => (
              <DailyBar
                key={d.date}
                value={d.total}
                max={maxDaily}
                label={formatDate(d.date)}
                sub={fmt(d.calls) + '次'}
              />
            ))}
          </div>
        </motion.div>

        {/* Model Breakdown */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">模型分布</h2>
          <div className="space-y-3">
            {tokenByModel.map((m, i) => {
              const p = (m.tokens / tokenSummary.totalTokens) * 100
              const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500']
              return (
                <div key={m.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{m.name}</span>
                    <span className="text-gray-500">{p.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${colors[i % colors.length]}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * i }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-right">{fmt(m.tokens)}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{m.calls}次</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Daily Table */}
        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">每日明细</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">日期</th>
                  <th className="pb-2 font-medium text-right">总 Token</th>
                  <th className="pb-2 font-medium text-right">Prompt</th>
                  <th className="pb-2 font-medium text-right">Completion</th>
                  <th className="pb-2 font-medium text-right">调用次数</th>
                  <th className="pb-2 font-medium text-right">次均 Token</th>
                </tr>
              </thead>
              <tbody>
                {dailyTokens.map((d, i) => (
                  <motion.tr
                    key={d.date}
                    className="border-b border-gray-50 text-gray-700"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="py-2.5 font-medium">{d.date}</td>
                    <td className="py-2.5 text-right font-mono">{fmt(d.total)}</td>
                    <td className="py-2.5 text-right font-mono text-violet-600">{fmt(d.prompt)}</td>
                    <td className="py-2.5 text-right font-mono text-amber-600">{fmt(d.completion)}</td>
                    <td className="py-2.5 text-right">{d.calls.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono text-gray-400">{fmt(Math.round(d.total / d.calls))}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Note */}
        <motion.div variants={fadeUp} className="text-center text-xs text-gray-400 pb-4">
          数据来源：get_token_usage · 部署前手动更新
        </motion.div>

      </motion.div>
    </div>
  )
}
