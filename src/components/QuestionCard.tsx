import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Info, Star, Maximize2, Loader2, ImageOff, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toggleFavoriteQuestion, isQuestionFavorite } from '../utils/storage';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean, selectedAnswer: string | string[]) => void;
  showExplanation?: boolean;
  isReview?: boolean;
  selectedAnswer?: string | string[];
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  showExplanation: initialShowExplanation = false,
  isReview = false,
  selectedAnswer: initialSelectedAnswer,
}) => {
  const [selected, setSelected] = useState<string | string[]>(initialSelectedAnswer || (question.type === 'multiple' ? [] : ''));
  const [isSubmitted, setIsSubmitted] = useState(isReview);
  const [showExplanation, setShowExplanation] = useState(initialShowExplanation || isReview);
  const [isStarred, setIsStarred] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    setIsStarred(isQuestionFavorite(question.id));
    if (isReview) {
      setSelected(initialSelectedAnswer || (question.type === 'multiple' ? [] : ''));
      setIsSubmitted(true);
      setShowExplanation(true);
    } else {
      setSelected(question.type === 'multiple' ? [] : '');
      setIsSubmitted(false);
      setShowExplanation(false);
    }
  }, [question.id, isReview, initialSelectedAnswer]);

  const handleSelect = (option: string) => {
    if (isSubmitted) return;

    if (question.type === 'multiple') {
      const current = selected as string[];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option].sort();
      setSelected(next);
    } else {
      setSelected(option);
      const isCorrect = option === question.answer;
      setIsSubmitted(true);
      setShowExplanation(true);
      onAnswer(isCorrect, option);
    }
  };

  const handleSubmitMultiple = () => {
    if (isSubmitted || question.type !== 'multiple') return;

    const currentSelected = selected as string[];
    const correctAnswer = question.answer as string[];
    const isCorrect =
      currentSelected.length === correctAnswer.length &&
      currentSelected.every(val => correctAnswer.includes(val));

    setIsSubmitted(true);
    setShowExplanation(true);
    onAnswer(isCorrect, currentSelected);
  };

  const getOptionStatus = (option: string) => {
    if (!isSubmitted) return 'default';

    const isCorrect = Array.isArray(question.answer)
      ? question.answer.includes(option)
      : question.answer === option;

    const isSelected = Array.isArray(selected)
      ? selected.includes(option)
      : selected === option;

    if (isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'wrong';
    return 'default';
  };

  const handleToggleStar = () => {
    const nextState = toggleFavoriteQuestion(question.id);
    setIsStarred(nextState);
  };

  const options = question.type === 'boolean' ? ['正确', '错误'] : question.options || [];

  return (
    <div className="card-base overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* ── Header: type badge + star ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-accent/10 text-accent text-[11px] font-bold rounded-lg">
              {question.type === 'single' ? '单选题' : question.type === 'multiple' ? '多选题' : '判断题'}
            </span>
            <span className="text-text-muted text-xs">#{question.id}</span>
          </div>
          <button
            onClick={handleToggleStar}
            className={cn(
              "p-2 rounded-full transition-all",
              isStarred ? "text-accent bg-accent/8" : "text-text-muted hover:text-text-secondary hover:bg-white/5"
            )}
            title={isStarred ? "取消收藏" : "收藏题目"}
          >
            <Star size={18} fill={isStarred ? "currentColor" : "none"} />
          </button>
        </div>

        {/* ── Question Text ── */}
        <h3 className="text-base sm:text-lg font-display font-medium text-text-primary mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* ── Image ── */}
        {question.image && (
          <div className="flex justify-center mb-6">
            <div className="relative group cursor-zoom-in max-w-[280px]" onClick={() => !imgError && setShowFullImage(true)}>
              {isImgLoading && !imgError && (
                <div className="absolute inset-0 bg-surface-tertiary animate-pulse flex items-center justify-center rounded-2xl border border-white/5 min-h-[200px]">
                  <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
                </div>
              )}
              {imgError ? (
                <div className="w-48 h-48 bg-surface-tertiary rounded-2xl border border-white/5 flex flex-col items-center justify-center text-text-muted">
                  <ImageOff size={32} className="mb-2" />
                  <span className="text-xs">图片加载失败</span>
                </div>
              ) : (
                <img
                  src={question.image}
                  alt="题目配图"
                  className={cn(
                    "w-full h-auto rounded-2xl border border-white/5 transition-all duration-300 shadow-card group-hover:shadow-card-hover",
                    isImgLoading ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => setIsImgLoading(false)}
                  onError={() => { setIsImgLoading(false); setImgError(true); }}
                />
              )}
              {!imgError && !isImgLoading && (
                <div className="absolute bottom-3 right-3 p-2 bg-black/60 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={16} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Options ── */}
        <div className="space-y-2.5">
          {options.map((option) => {
            const label = option.includes('、') ? option.split('、')[0] : option;
            const status = getOptionStatus(label);
            const isSelected = Array.isArray(selected) ? selected.includes(label) : selected === label;

            return (
              <button
                key={option}
                onClick={() => handleSelect(label)}
                disabled={isSubmitted}
                className={cn(
                  "w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border transition-all text-left",
                  status === 'default' && !isSelected && "border-white/5 bg-surface-card hover:border-accent/30 hover:bg-accent/5",
                  status === 'default' && isSelected && "border-accent bg-accent/8",
                  status === 'correct' && "border-success bg-success/5",
                  status === 'wrong' && "border-danger bg-danger/5"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  status === 'default' && !isSelected && "bg-surface-tertiary border border-white/10 text-text-muted",
                  status === 'default' && isSelected && "bg-accent text-black",
                  status === 'correct' && "bg-success text-white",
                  status === 'wrong' && "bg-danger text-white"
                )}>
                  {status === 'correct' ? <CheckCircle2 size={15} /> :
                   status === 'wrong' ? <XCircle size={15} /> :
                   label}
                </div>
                <span className={cn(
                  "flex-1 text-sm",
                  status === 'default' && "text-text-primary",
                  status === 'correct' && "text-success",
                  status === 'wrong' && "text-danger"
                )}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Submit (multiple choice) ── */}
        {question.type === 'multiple' && !isSubmitted && (
          <button
            onClick={handleSubmitMultiple}
            disabled={(selected as string[]).length === 0}
            className="w-full mt-6 py-3 bg-accent text-black rounded-xl font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            提交答案
          </button>
        )}

        {/* ── Explanation ── */}
        {showExplanation && (
          <div className="mt-6 p-5 bg-surface-tertiary rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-accent mb-3 font-bold text-sm">
              <Info size={16} />
              <span>答案解析</span>
            </div>
            <div className="mb-2 text-sm">
              <span className="text-text-muted">正确答案：</span>
              <span className="text-success font-bold">
                {Array.isArray(question.answer) ? question.answer.join(', ') : question.answer}
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* ── Full Image Modal ── */}
      {showFullImage && question.image && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-12"
          onClick={() => setShowFullImage(false)}
        >
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all">
            <X size={24} />
          </button>
          <img
            src={question.image}
            alt="全屏题目配图"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
