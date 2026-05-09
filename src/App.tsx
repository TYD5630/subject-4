import { useState, useEffect } from 'react'
import {
  BookOpen, Settings, BarChart3, Info,
  Star, Shuffle, Layers, X, Trash2, AlertCircle,
  Shield, TrafficCone, CloudRain, Mountain, Moon, Zap,
  Heart, Smile, ChevronRight, Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PracticeMode } from './components/PracticeMode'
import { ExamMode } from './components/ExamMode'
import { WrongQuestionsMode } from './components/WrongQuestionsMode'
import { FavoritesMode } from './components/FavoritesMode'
import { StatsCenter } from './components/StatsCenter'
import { getWrongQuestionIds, getFavoriteQuestionIds, clearAllData } from './utils/storage'
import { Question, CHAPTERS } from './types'

// ── Animation Variants ──────────────────────
const easeOut = [0.25, 0.1, 0.25, 1] as const

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
}

const fadeSlideRight = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeOut } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } }
}

// ── Chapter Icon Map ───────────────────────
const CHAPTER_ICONS: Record<number, React.ReactNode> = {
  1: <Shield size={22} />,
  2: <TrafficCone size={22} />,
  3: <CloudRain size={22} />,
  4: <Mountain size={22} />,
  5: <Moon size={22} />,
  6: <Zap size={22} />,
  7: <AlertCircle size={22} />,
  8: <Heart size={22} />,
  9: <Smile size={22} />,
  10: <Settings size={22} />,
}

// ── Modes Configuration ────────────────────
const MODES = [
  { key: 'random' as const, icon: Shuffle, label: '随机练习', desc: '随机抽题，全面复习', color: 'accent', bgClass: 'bg-accent/10', textClass: 'text-accent' },
  { key: 'exam' as const, icon: Target, label: '模拟考试', desc: '限时真题模拟', color: 'info', bgClass: 'bg-info/10', textClass: 'text-info' },
  { key: 'wrong' as const, icon: AlertCircle, label: '错题集', desc: '针对练习薄弱环节', color: 'danger', bgClass: 'bg-danger/10', textClass: 'text-danger' },
  { key: 'favorite' as const, icon: Star, label: '我的收藏', desc: '重点题目集中复习', color: 'success', bgClass: 'bg-success/10', textClass: 'text-success' },
]

// ═══════════════════════════════════════════
//  App Component
// ═══════════════════════════════════════════
function App() {
  const [mode, setMode] = useState<'home' | 'practice' | 'exam' | 'wrong' | 'favorite' | 'stats'>('home')
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, wrong: 0, favorite: 0 })
  const [showSettings, setShowSettings] = useState(false)
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all')
  const [isRandomMode, setIsRandomMode] = useState(false)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/questions.json')
        if (!response.ok) throw new Error('题库加载失败，请检查网络或刷新页面')
        const data = await response.json()
        setAllQuestions(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [])

  useEffect(() => {
    setStats({
      total: allQuestions.length,
      wrong: getWrongQuestionIds().length,
      favorite: getFavoriteQuestionIds().length,
    })
  }, [mode, allQuestions])

  const getChapterCount = (chapterId: number) =>
    allQuestions.filter(q => q.chapter === chapterId).length

  const startPractice = (chapter?: number | 'all', random?: boolean) => {
    setChapterFilter(chapter ?? 'all')
    setIsRandomMode(random ?? false)
    setMode('practice')
  }

  const startExam = () => setMode('exam')

  const handleModeClick = (key: string) => {
    switch (key) {
      case 'random': startPractice('all', true); break
      case 'exam': startExam(); break
      case 'wrong': setMode('wrong'); break
      case 'favorite': setMode('favorite'); break
    }
  }

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-accent/10 animate-pulse" />
          </div>
        </div>
        <p className="text-text-secondary text-sm font-body">正在加载题库...</p>
      </div>
    )
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center">
          <AlertCircle className="text-danger" size={32} />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold mb-2">加载失败</h2>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          刷新重试
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════
  //  Home Page
  // ═══════════════════════════════════════════
  if (mode === 'home') {
    return (
      <>
        <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          {/* ── Header ── */}
          <motion.header
            initial="hidden"
            animate="show"
            variants={container}
            className="flex items-center justify-between mb-8 sm:mb-12"
          >
            <motion.div variants={fadeSlideRight} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <BookOpen className="text-accent" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-display font-bold tracking-tight">
                  科目四
                  <span className="text-accent">·</span>
                  理论考试
                </h1>
                <p className="text-xs text-text-muted font-body">模拟训练系统</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-2">
              <button
                onClick={() => { setShowSettings(true) }}
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-white/10 transition-all"
              >
                <Settings size={18} />
              </button>
            </motion.div>
          </motion.header>

          {/* ── Stats Row ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10"
          >
            {[
              { label: '总题数', value: stats.total, icon: Layers, color: 'text-accent' },
              { label: '错题', value: stats.wrong, icon: AlertCircle, color: 'text-danger' },
              { label: '收藏', value: stats.favorite, icon: Star, color: 'text-success' },
            ].map((s) => (
              <motion.div key={s.label} variants={scaleIn} className="card-base p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-xs text-text-muted font-body">{s.label}</span>
                </div>
                <p className={`text-2xl sm:text-3xl font-display font-bold tracking-tight ${s.color}`}>
                  {s.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Mode Grid ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10"
          >
            {MODES.map((m) => (
              <motion.button
                key={m.key}
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeClick(m.key)}
                className="card-base p-4 sm:p-5 text-left group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${m.bgClass} flex items-center justify-center mb-3`}>
                  <m.icon size={20} className={m.textClass} />
                </div>
                <h3 className="text-sm sm:text-base font-display font-semibold mb-0.5">{m.label}</h3>
                <p className="text-xs text-text-muted font-body">{m.desc}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* ── Stats Center Card ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="mb-8 sm:mb-10"
          >
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setMode('stats')}
              className="card-base p-4 sm:p-5 w-full text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-display font-semibold">统计中心</h3>
                    <p className="text-xs text-text-muted font-body">查看学习进度与数据</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:text-text-primary transition-colors" />
              </div>
            </motion.button>
          </motion.div>

          {/* ── Section: 章节练习 ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="mb-6"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs font-display font-semibold text-text-muted tracking-widest uppercase">
                章节练习
              </span>
              <div className="h-px flex-1 bg-white/5" />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {CHAPTERS.map((ch) => {
                const count = getChapterCount(ch.id)
                return (
                  <motion.button
                    key={ch.id}
                    variants={fadeUp}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startPractice(ch.id)}
                    className="card-base p-4 sm:p-5 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/8 flex items-center justify-center text-accent/70 group-hover:text-accent group-hover:bg-accent/12 transition-all">
                        {CHAPTER_ICONS[ch.id]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-display font-semibold truncate">
                          {ch.name}
                        </h4>
                        <p className="text-xs text-text-muted font-body">
                          {count} 题
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-text-muted/70 font-body line-clamp-2">
                      {ch.description}
                    </p>
                  </motion.button>
                )
              })}
            </div>

            {/* ── 最后一章的偏移 — 营造 asymmetry ── */}
            {CHAPTERS.length % 3 !== 0 && (
              <div className="hidden sm:block" />
            )}
          </motion.div>

          {/* ── Footer ── */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.6 } }}
            className="text-center py-6 mt-4"
          >
            <p className="text-xs text-text-muted/50 font-body">
              科目四理论考试模拟训练 · {stats.total} 题全量题库
            </p>
          </motion.footer>
        </div>

        {/* ── Settings Modal ── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettings(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full max-w-sm card-base p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-accent" />
                    <h2 className="text-base font-display font-semibold">设置</h2>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (confirm('确定要清除所有学习记录吗？包括错题和收藏。')) {
                        clearAllData()
                        setStats(prev => ({ ...prev, wrong: 0, favorite: 0 }))
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-danger/5 text-danger hover:bg-danger/10 transition-colors text-sm"
                  >
                    <Trash2 size={16} />
                    <span className="font-medium">清除所有学习记录</span>
                  </button>

                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Info size={12} />
                      <span>题库版本: {stats.total} 题</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ═══════════════════════════════════════════
  //  Practice / Exam / Wrong / Favorite / Stats
  // ═══════════════════════════════════════════
  const commonProps = {
    questions: allQuestions,
    onBack: () => setMode('home'),
  }

  switch (mode) {
    case 'practice':
      return (
        <PracticeMode
          {...commonProps}
          chapterFilter={chapterFilter}
          isRandomMode={isRandomMode}
        />
      )
    case 'exam':
      return <ExamMode {...commonProps} />
    case 'wrong':
      return <WrongQuestionsMode {...commonProps} />
    case 'favorite':
      return <FavoritesMode {...commonProps} />
    case 'stats':
      return <StatsCenter {...commonProps} />
    default:
      return null
  }
}

export default App
