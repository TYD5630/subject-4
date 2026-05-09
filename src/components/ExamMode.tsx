import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import { Question } from '../types';
import {
  Clock, AlertTriangle, CheckCircle2, Eye, ChevronLeft,
  ChevronRight, Grid, X, Flag, Home
} from 'lucide-react';
import { addWrongQuestion, saveExamRecord } from '../utils/storage';

interface ExamModeProps {
  questions: Question[];
  onBack: () => void;
}

export const ExamMode: React.FC<ExamModeProps> = ({ questions: allQuestions, onBack }) => {
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { isCorrect: boolean; selected: string | string[] }>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  // Initialize exam with 50 random questions
  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, 50));
  }, [allQuestions]);

  const finishExam = useCallback((isAutoSubmit = false) => {
    const answeredIds = Object.keys(answers).map(Number);
    const totalQuestionsCount = examQuestions.length;
    if (totalQuestionsCount === 0) return;

    const unansweredCount = totalQuestionsCount - answeredIds.length;

    if (!isAutoSubmit && unansweredCount > 0 && timeLeft > 0) {
      if (!window.confirm(`还有 ${unansweredCount} 道题没做，确定要提前交卷吗？`)) return;
    }

    const results = Object.values(answers);
    const correctCount = results.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / totalQuestionsCount) * 100);
    const timeSpent = Math.max(0, 45 * 60 - timeLeft);

    try {
      saveExamRecord({ score, correctCount, totalCount: totalQuestionsCount, timeSpent });
    } catch (err) {
      console.error('Failed to save exam record:', err);
    }

    setIsFinished(true);
  }, [answers, examQuestions, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished) { finishExam(true); return; }
    if (isFinished) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, finishExam]);

  const handleAnswer = (isCorrect: boolean, selected: string | string[]) => {
    const questionId = examQuestions[currentIndex].id;
    setAnswers(prev => ({ ...prev, [questionId]: { isCorrect, selected } }));
    if (!isCorrect) addWrongQuestion(questionId);
  };

  const toggleFlag = () => {
    const qId = examQuestions[currentIndex].id;
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId: number) => {
    if (answers[qId]) return 'answered';
    if (flaggedQuestions.has(qId)) return 'flagged';
    return 'unanswered';
  };

  const totalCount = examQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const wrongCount = answeredCount - correctCount;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const passed = score >= 90;

  // ── Loading ──
  if (examQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>
        <p className="text-text-secondary text-sm">正在生成模拟试卷...</p>
      </div>
    );
  }

  // ══════════════════════════════════
  //  Results View
  // ══════════════════════════════════
  if (isFinished) {
    const timeSpent = Math.max(0, 45 * 60 - timeLeft);

    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {showReview ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowReview(false)}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                <ChevronLeft size={18} />
                <span>返回成绩</span>
              </button>
              <span className="text-xs text-text-muted">
                {totalCount} 题 · 答对 {correctCount} 题
              </span>
            </div>
            {examQuestions.map((q, i) => (
              <div key={q.id} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-text-muted">第 {i + 1} 题</span>
                  {answers[q.id]?.isCorrect
                    ? <CheckCircle2 size={14} className="text-success" />
                    : answers[q.id] && <X size={14} className="text-danger" />
                  }
                </div>
                <QuestionCard
                  question={q}
                  onAnswer={() => {}}
                  showExplanation
                  isReview
                  selectedAnswer={answers[q.id]?.selected}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 sm:py-12"
          >
            {/* Score Circle */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={passed ? '#22c55e' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 327} 327`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-display font-black">{score}</span>
                <span className="text-xs text-text-muted">分</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              {passed ? (
                <CheckCircle2 size={20} className="text-success" />
              ) : (
                <AlertTriangle size={20} className="text-danger" />
              )}
              <h2 className={`text-xl font-display font-bold ${passed ? 'text-success' : 'text-danger'}`}>
                {passed ? '恭喜通过！' : '未通过'}
              </h2>
            </div>
            <p className="text-text-muted text-xs mb-2">及格线 90 分</p>

            <div className="flex items-center justify-center gap-6 mt-5 mb-8 text-sm">
              <div>
                <span className="text-success font-bold">{correctCount}</span>
                <span className="text-text-muted">/{totalCount}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div>
                <span className="text-danger font-bold">{wrongCount}</span>
                <span className="text-text-muted"> 错误</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="text-text-muted">
                {Math.floor(timeSpent / 60)}分{timeSpent % 60}秒
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black font-bold hover:bg-accent-hover transition-all text-sm shadow-glow-accent"
              >
                <Eye size={16} />
                查看解析
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all text-sm"
              >
                <Home size={16} />
                返回首页
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════
  //  Exam View
  // ══════════════════════════════════
  const currentQ = examQuestions[currentIndex];
  const timerUrgency = timeLeft < 300 ? 'text-danger' : timeLeft < 600 ? 'text-accent' : 'text-text-muted';

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">退出考试</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFlag}
            className={`p-2 rounded-lg transition-all ${
              flaggedQuestions.has(currentQ.id)
                ? 'text-accent bg-accent/8'
                : 'text-text-muted hover:text-accent hover:bg-accent/8'
            }`}
            title={flaggedQuestions.has(currentQ.id) ? '取消标记' : '标记此题'}
          >
            <Flag size={18} fill={flaggedQuestions.has(currentQ.id) ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => setShowSheet(!showSheet)}
            className={`p-2 rounded-lg transition-all ${
              showSheet ? 'text-accent bg-accent/8' : 'text-text-muted hover:text-accent hover:bg-accent/8'
            }`}
            title="答题卡"
          >
            <Grid size={18} />
          </button>

          <div className={`flex items-center gap-1.5 font-bold text-sm ${timerUrgency} ${timeLeft < 300 ? 'animate-pulse' : ''}`}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="flex items-center justify-between mb-2 text-xs text-text-muted">
        <span>第 {currentIndex + 1}/{totalCount} 题</span>
        <div className="flex gap-3">
          <span className="text-success">已答 {answeredCount}</span>
          {flaggedQuestions.size > 0 && <span className="text-accent">标记 {flaggedQuestions.size}</span>}
          <span>剩余 {totalCount - answeredCount}</span>
        </div>
      </div>
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-success transition-all duration-300 rounded-full"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {/* ── Answer Sheet ── */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="card-base p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-display font-semibold">答题卡</span>
                <button
                  onClick={() => setShowSheet(false)}
                  className="text-text-muted hover:text-text-primary text-xs transition-colors"
                >
                  关闭
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-success" /> 已答
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-accent" /> 标记
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-surface-tertiary border border-white/10" /> 未答
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-accent" /> 当前
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {examQuestions.map((q, i) => {
                  const status = getQuestionStatus(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentIndex(i); setShowSheet(false); }}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        i === currentIndex
                          ? 'bg-accent text-black shadow-glow-accent'
                          : status === 'answered'
                            ? answers[q.id]?.isCorrect
                              ? 'bg-success text-white'
                              : 'bg-danger text-white'
                            : flaggedQuestions.has(q.id)
                              ? 'bg-accent/40 text-white'
                              : 'bg-surface-tertiary text-text-muted hover:bg-white/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-text-muted">
                <span>正确: {correctCount}</span>
                <span>错误: {wrongCount}</span>
                <span>未答: {totalCount - answeredCount}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Question ── */}
      <QuestionCard
        key={currentQ.id}
        question={currentQ}
        onAnswer={handleAnswer}
      />

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">上一题</span>
        </button>

        <button
          onClick={() => finishExam(false)}
          className="px-5 py-2.5 rounded-xl bg-danger text-white font-bold hover:bg-red-600 transition-all text-sm shadow-lg shadow-danger/20"
        >
          交卷
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(totalCount - 1, prev + 1))}
          disabled={currentIndex === totalCount - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <span className="hidden sm:inline">下一题</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ExamMode;
