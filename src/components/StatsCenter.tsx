import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExamHistory, ExamRecord, clearAllData } from '../utils/storage';
import {
  Home, History, Award, Clock, Trash2, TrendingUp, Calendar,
  BarChart3
} from 'lucide-react';

interface StatsCenterProps {
  onBack: () => void;
}

export const StatsCenter: React.FC<StatsCenterProps> = ({ onBack }) => {
  const [history, setHistory] = useState<ExamRecord[]>([]);

  useEffect(() => {
    setHistory(getExamHistory());
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
    : 0;

  const passRate = history.length > 0
    ? Math.round((history.filter(r => r.score >= 90).length / history.length) * 100)
    : 0;

  const handleClear = () => {
    if (window.confirm('确定要清空所有数据（包括错题、收藏和考试记录）吗？')) {
      clearAllData();
      setHistory([]);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <Home size={18} />
          <span>返回首页</span>
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-danger/70 hover:text-danger transition-colors text-xs font-bold"
        >
          <Trash2 size={14} />
          <span>清空所有数据</span>
        </button>
      </div>

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <BarChart3 size={20} className="text-accent" />
          </div>
          <h1 className="text-xl font-display font-bold">统计中心</h1>
        </div>
        <p className="text-text-muted text-sm ml-[52px]">查看你的学习进度与考试记录</p>
      </motion.div>

      {/* ── Summary Cards ── */}
      {history.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10"
        >
          <div className="card-base p-4 sm:p-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-3">
              <TrendingUp size={20} />
            </div>
            <div className="text-text-muted text-xs font-bold mb-1">平均分数</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-text-primary">
              {averageScore}
              <span className="text-sm font-normal text-text-muted"> 分</span>
            </div>
          </div>

          <div className="card-base p-4 sm:p-5">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success mb-3">
              <Award size={20} />
            </div>
            <div className="text-text-muted text-xs font-bold mb-1">通过率</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-text-primary">
              {passRate}
              <span className="text-sm font-normal text-text-muted">%</span>
            </div>
          </div>

          <div className="card-base p-4 sm:p-5 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info mb-3">
              <History size={20} />
            </div>
            <div className="text-text-muted text-xs font-bold mb-1">考试次数</div>
            <div className="text-2xl sm:text-3xl font-display font-black text-text-primary">
              {history.length}
              <span className="text-sm font-normal text-text-muted"> 次</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-10 text-center mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={28} className="text-accent" />
          </div>
          <h3 className="text-base font-display font-semibold mb-1">暂无考试记录</h3>
          <p className="text-text-muted text-sm">开始一次模拟考试，你的成绩将在这里展示</p>
        </motion.div>
      )}

      {/* ── History ── */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={16} className="text-text-muted" />
            <h2 className="text-sm font-display font-semibold">考试记录</h2>
          </div>

          <div className="space-y-2">
            {history.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.25 + index * 0.05 } }}
                className="card-base p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Score badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                    record.score >= 90
                      ? 'bg-success/10 text-success'
                      : record.score >= 70
                        ? 'bg-accent/10 text-accent'
                        : 'bg-danger/10 text-danger'
                  }`}>
                    {record.score}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-display font-semibold">
                        {record.correctCount}/{record.totalCount}
                      </span>
                      {record.score >= 90 && (
                        <Award size={14} className="text-success" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(record.timeSpent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StatsCenter;
