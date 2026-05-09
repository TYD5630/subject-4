export type QuestionType = 'single' | 'multiple' | 'boolean';

export interface Chapter {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  chapter: number; // 章节ID
  question: string;
  options?: string[]; // Used for single and multiple
  answer: string | string[]; // For single/boolean: "A", "正确", "错误". For multiple: ["A", "B"]
  explanation: string;
  image?: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 1, name: '安全行车常识', description: '日常驾驶中的安全操作规范', icon: 'Shield' },
  { id: 2, name: '交通信号', description: '交通标志、标线、交警手势识别', icon: 'TrafficCone' },
  { id: 3, name: '恶劣天气安全驾驶', description: '雨雪雾天等恶劣条件下的驾驶技巧', icon: 'CloudRain' },
  { id: 4, name: '复杂道路安全驾驶', description: '山区、隧道、桥梁等复杂路段驾驶', icon: 'Mountain' },
  { id: 5, name: '夜间安全驾驶', description: '夜间灯光使用与安全驾驶', icon: 'Moon' },
  { id: 6, name: '高速公路安全驾驶', description: '高速行车规则与安全', icon: 'Zap' },
  { id: 7, name: '紧急情况处置', description: '车辆故障、事故等紧急情况应对', icon: 'AlertTriangle' },
  { id: 8, name: '事故处理与急救', description: '交通事故处理流程与伤员急救', icon: 'Heart' },
  { id: 9, name: '文明驾驶与职业道德', description: '文明礼让、职业操守', icon: 'Smile' },
  { id: 10, name: '车辆维护与检查', description: '日常保养与行车前检查', icon: 'Settings' },
];

export interface ExamResult {
  score: number;
  correctCount: number;
  wrongCount: number;
  timeSpent: number; // in seconds
  wrongQuestions: number[]; // ids of wrong questions
}

export interface ExamQuestion {
  question: Question;
  selected?: string | string[];
  isFlagged: boolean;
  isAnswered: boolean;
}
