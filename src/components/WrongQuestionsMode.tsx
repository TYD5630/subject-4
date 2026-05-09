import React, { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { Question } from '../types';
import { ChevronLeft, ChevronRight, Home, Trash2, CheckCircle2 } from 'lucide-react';
import { getWrongQuestionIds, removeWrongQuestion, clearWrongQuestions } from '../utils/storage';

interface WrongQuestionsModeProps {
  questions: Question[];
  onBack: () => void;
}

export const WrongQuestionsMode: React.FC<WrongQuestionsModeProps> = ({ questions: allQuestions, onBack }) => {
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allQuestions.length > 0) {
      const ids = getWrongQuestionIds();
      const filtered = allQuestions.filter(q => ids.includes(q.id));
      setWrongQuestions(filtered);
    }
  }, [allQuestions]);

  const handleRemove = () => {
    const currentQ = wrongQuestions[currentIndex];
    removeWrongQuestion(currentQ.id);
    const nextQuestions = wrongQuestions.filter(q => q.id !== currentQ.id);
    setWrongQuestions(nextQuestions);
    if (currentIndex >= nextQuestions.length && nextQuestions.length > 0) {
      setCurrentIndex(nextQuestions.length - 1);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空错题本吗？')) {
      clearWrongQuestions();
      setWrongQuestions([]);
      setCurrentIndex(0);
    }
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success">
          <CheckCircle2 />
        </div>
        <h2 className="text-xl font-display font-semibold">错题本是空的</h2>
        <p className="text-text-secondary text-sm">太棒了！你还没有做错任何题目，或者已经全部掌握了。</p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-colors">
          返回首页
        </button>
      </div>
    );
  }

  const currentQuestion = wrongQuestions[currentIndex];

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <Home size={18} />
          <span>退出错题本</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted font-body">
            错题: {currentIndex + 1}/{wrongQuestions.length}
          </span>
          {wrongQuestions.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-xs font-bold"
            >
              <Trash2 size={14} />
              清空全部
            </button>
          )}
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-danger transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / wrongQuestions.length) * 100}%` }}
        />
      </div>

      {/* ── Question ── */}
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onAnswer={() => {}}
        showExplanation
        isReview
      />

      {/* ── Actions ── */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <ChevronLeft size={18} />
          上一题
        </button>

        <button
          onClick={handleRemove}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-all text-sm font-bold"
        >
          <CheckCircle2 size={16} />
          移除本题
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(wrongQuestions.length - 1, prev + 1))}
          disabled={currentIndex === wrongQuestions.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          下一题
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default WrongQuestionsMode;
