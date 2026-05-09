import React, { useState, useEffect } from 'react';
import { QuestionCard } from './QuestionCard';
import { Question, CHAPTERS } from '../types';
import { ChevronLeft, ChevronRight, Home, Shuffle, List, BookOpen } from 'lucide-react';
import { addWrongQuestion } from '../utils/storage';

interface PracticeModeProps {
  questions: Question[];
  onBack: () => void;
  chapterFilter?: number | 'all';
  isRandomMode?: boolean;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ questions, onBack, chapterFilter, isRandomMode }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (isRandomMode) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      setShuffledQuestions(shuffled);
    } else {
      setShuffledQuestions(questions);
    }
    setCurrentIndex(0);
    setAnsweredCount(0);
    setCorrectCount(0);
  }, [questions, isRandomMode]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const currentChapter = currentQuestion
    ? CHAPTERS.find(ch => ch.id === currentQuestion.chapter)
    : null;

  const handleAnswer = (isCorrect: boolean) => {
    setAnsweredCount(prev => prev + 1);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      addWrongQuestion(currentQuestion.id);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowList(false);
  };

  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-display font-semibold">该章节暂未收录题目</h2>
        <p className="text-text-secondary text-sm">请选择其他章节进行练习</p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-sm hover:bg-accent-hover transition-colors">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <Home size={18} />
          <span className="hidden sm:inline">退出练习</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowList(!showList)}
            className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/8 transition-all"
            title="题目列表"
          >
            <List size={18} />
          </button>
          <span className="text-sm text-text-muted font-body">
            {currentIndex + 1}/{shuffledQuestions.length}
          </span>
        </div>
      </div>

      {/* ── Chapter Info + Progress ── */}
      <div className="mb-6">
        {currentChapter && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-lg bg-accent/8 text-accent font-bold">
              {currentChapter.name}
            </span>
            <span className="text-xs text-text-muted">
              {isRandomMode ? '随机练习' : chapterFilter === 'all' ? '全部章节' : ''}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted">
            答对 <span className="text-success font-bold">{correctCount}</span> / 已答 {answeredCount}
          </span>
          <span className="text-xs text-text-muted">
            {!isRandomMode && '顺序练习'}
          </span>
        </div>
        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Question Card ── */}
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        onAnswer={handleAnswer}
      />

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">上一题</span>
        </button>

        <button
          onClick={() => {
            const shuffled = [...shuffledQuestions].sort(() => 0.5 - Math.random());
            setShuffledQuestions(shuffled);
            setCurrentIndex(0);
            setAnsweredCount(0);
            setCorrectCount(0);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/8 text-accent hover:bg-accent/12 transition-all text-sm font-bold"
        >
          <Shuffle size={16} />
          <span className="hidden sm:inline">重排</span>
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, shuffledQuestions.length - 1))}
          disabled={currentIndex === shuffledQuestions.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 text-text-secondary hover:bg-surface-hover hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          <span className="hidden sm:inline">下一题</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Question List Panel ── */}
      {showList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowList(false)} />
          <div className="relative w-full max-w-md card-base p-5 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-semibold">题目列表</h3>
              <button
                onClick={() => setShowList(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <List size={16} />
              </button>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {shuffledQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                    idx === currentIndex
                      ? 'bg-accent text-black'
                      : 'bg-surface-tertiary text-text-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
