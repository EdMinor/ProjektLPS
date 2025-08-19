export interface Topic {
  id: number;
  name: string;
}

export interface Catalog {
  id: number;
  topicId: number;
  code: string;
  title: string;
  questionCount: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  catalogId: number;
  type: 'single' | 'multi' | 'fill';
  text: string;
  options: QuestionOption[];
  solution?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading?: boolean;
}
