export interface SimulationConfig {
  catalogId: number;
  questionCount: number;
  timeLimit: boolean;
  timeLimitMinutes: number | null;
  shuffleQuestions: boolean;
}

export interface SimulationAnswer {
  questionId: number;
  answers: string[];
  isCorrect: boolean;
  timeSpent: number; // in Sekunden
  timestamp: Date;
}

export interface SimulationState {
  config: SimulationConfig | null;
  questions: Question[] | null;
  currentQuestionIndex: number;
  answers: Map<number, SimulationAnswer>;
  startTime: Date | null;
  endTime: Date | null;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number | null; // in Sekunden
}

export interface SimulationResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  totalTime: number; // in Sekunden
  averageTimePerQuestion: number;
  timePerQuestion: Map<number, number>;
  completedAt: Date;
}

export interface Question {
  id: number;
  catalogId: number;
  type: 'single' | 'multi' | 'fill';
  text: string;
  options: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  explanation?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}
