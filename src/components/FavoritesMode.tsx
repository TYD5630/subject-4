import React, { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { Question } from '../types';
import { ChevronLeft, ChevronRight, Home, Star } from 'lucide-react';
import { getFavoriteQuestionIds } from '../utils/storage';

interface FavoritesModeProps {
  questions: Question[];
  onBack: () => void;
}

export const FavoritesMode: React.FC<FavoritesModeProps> = ({ questions: allQuestions, onBack }) => {
  const [favoriteQuestions, setFavoriteQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allQuestions.length > 0) {
      const ids = getFavoriteQuestionIds();
      const filtered = allQuestions.filter(q => ids.includes(q.id));
      setFavoriteQuestions(filtered);
    }
  }, [allQuestions]);

  if (favoriteQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <Star size={32} />
        </div>
        <h2 className="text-xl font-display font-semibold">收藏夹是空的</h2>
        <p className="text-text-secondary text-sm">你可以把比较难记或者容易出错的题目收藏起来，方便集中复习。</p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-colors">
          返回首页
        </button>
      </div>
    );
  }

  const currentQuestion = favoriteQuestions[currentIndex];

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <Home size={18} />
          <span>退出收藏</span>
        </button>
        <span className="text-sm text-text-muted font-body">
          进度: {currentIndex + 1}/{favoriteQuestions.length}
        </span>
      </div>

      {/* ── Progress ── */}
      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / favoriteQuestions.length) * 100}%` }}
        />
      </div>

      {/* ── Question ── */}
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onAnswer={() => {}}
      />

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <ChevronLeft size={20} />
          上一题
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, favoriteQuestions.length - 1))}
          disabled={currentIndex === favoriteQuestions.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          下一题
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default FavoritesMode;
