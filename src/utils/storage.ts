const WRONG_QUESTIONS_KEY = 'subject_4_wrong_questions';
const FAVORITE_QUESTIONS_KEY = 'subject_4_favorite_questions';

export const getWrongQuestionIds = (): number[] => {
  const stored = localStorage.getItem(WRONG_QUESTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addWrongQuestion = (id: number) => {
  const current = getWrongQuestionIds();
  if (!current.includes(id)) {
    const next = [...current, id];
    localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(next));
  }
};

export const removeWrongQuestion = (id: number) => {
  const current = getWrongQuestionIds();
  const next = current.filter(item => item !== id);
  localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(next));
};

export const clearWrongQuestions = () => {
  localStorage.removeItem(WRONG_QUESTIONS_KEY);
};

export const getFavoriteQuestionIds = (): number[] => {
  const stored = localStorage.getItem(FAVORITE_QUESTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleFavoriteQuestion = (id: number) => {
  const current = getFavoriteQuestionIds();
  const isFavorite = current.includes(id);
  const next = isFavorite 
    ? current.filter(item => item !== id)
    : [...current, id];
  localStorage.setItem(FAVORITE_QUESTIONS_KEY, JSON.stringify(next));
  return !isFavorite;
};

export const isQuestionFavorite = (id: number): boolean => {
  return getFavoriteQuestionIds().includes(id);
};

const EXAM_HISTORY_KEY = 'subject_4_exam_history';

export interface ExamRecord {
  id: string;
  date: string;
  score: number;
  correctCount: number;
  totalCount: number;
  timeSpent: number;
}

export const saveExamRecord = (record: Omit<ExamRecord, 'id' | 'date'>) => {
  const history = getExamHistory();
  const newRecord: ExamRecord = {
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  const next = [newRecord, ...history].slice(0, 50); // Keep last 50 records
  localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(next));
};

export const getExamHistory = (): ExamRecord[] => {
  const stored = localStorage.getItem(EXAM_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearAllData = () => {
  localStorage.clear();
};
