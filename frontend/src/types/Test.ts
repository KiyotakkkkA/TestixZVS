export interface TestSession {
  testId: string;
  source?: 'local' | 'db';
  currentQuestionIndex: number;
  userAnswers: Record<number, number[] | string[]>;
  answerEvaluations?: Record<
    number,
    {
      scorePercent: number;
      comment: string;
      userAnswerText: string;
    }
  >;
  startTime: number;
  endTime?: number;
  settings?: TestSettings;
  mode?: 'normal' | 'express';
  questionIds?: number[];
  timeLimitSeconds?: number;
}

export type FullAnswerCheckMode = 'lite' | 'medium' | 'hard' | 'unreal';

export interface TestSettings {
  passThreshold: number;
  hintsEnabled: boolean;
  checkAfterAnswer: boolean;
  showIncorrectAtEnd: boolean;
  fullAnswerCheckMode: FullAnswerCheckMode;
}

export interface IncorrectReviewItem {
  questionNumber: number;
  questionText: string;
  correctAnswersText: string[];
}

export interface FullAnswerReviewItem {
  questionNumber: number;
  questionText: string;
  userAnswerText: string;
  scorePercent: number;
  comment: string;
}

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number;
  passThreshold?: number;
  passed?: boolean;
  settings?: TestSettings;
  incorrectReview?: IncorrectReviewItem[];
  fullAnswerReview?: FullAnswerReviewItem[];
  answers: {
    questionId: number;
    userAnswer: number[] | string[];
    correct: boolean;
    scorePercent?: number;
    comment?: string;
  }[];
}

export interface TestQuestionBase {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'matching' | 'full_answer';
  files?: QuestionMediaFile[];
}

export type QuestionMediaFile = {
  id: number;
  name: string;
  url: string;
  mime_type?: string | null;
  size?: number | null;
};

export interface SingleChoiceQuestion extends TestQuestionBase {
  type: 'single';
  options: string[];
  correctAnswers: number[];
}

export interface MultipleChoiceQuestion extends TestQuestionBase {
  type: 'multiple';
  options: string[];
  correctAnswers: number[];
}

export interface MatchingQuestion extends TestQuestionBase {
  type: 'matching';
  terms: { [key: string]: string }; // A, B, C, D...
  meanings: { [key: number]: string }; // 0, 1, 2, 3...
  correctAnswers: string[]; // ["A0", "B1", "C2", ...]
}

export interface FullAnswerQuestion extends TestQuestionBase {
  type: 'full_answer';
  correctAnswers: string[];
}

export type TestQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | MatchingQuestion
  | FullAnswerQuestion;

export interface Test {
  uuid: string;
  discipline_name: string;
  total_questions: number;
  total_disabled: number;
  is_current_user_creator?: boolean;
  questions: TestQuestion[];
}

export type PublicTestResponse = {
  test: {
    id: string;
    title: string;
    is_current_user_creator: boolean;
    total_questions: number;
    total_disabled: number;
    questions: TestQuestion[];
  };
};

export type TestCompletitionStatisticsPayload = {
  test_id: string;
  type: 'started' | 'finished';
  right_answers: number;
  wrong_answers: number;
  percentage: number;
  time_taken?: number;
};

export const LOCAL_STORAGE_KEYS = {
  TEST_SESSION: 'testix_test_session',
  CURRENT_TEST_ID: 'testix_current_test_id',
  TEST_RESULT: 'testix_test_result',
};
