import type { TestQuestion } from "./TestQuestion";
import { createDemoQuestions } from "./TestQuestion";

export type TestModel = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  questions: TestQuestion[];
  estimatedPassTime: number;
  rating: number;
  passedCount: number;
  createdAt: string;
  icon: string;
};

export type AvailableTest = Omit<
  TestModel,
  "questions" | "estimatedPassTime"
> & {
  questionsCount: number;
  duration: number;
};

export type SortOption = "title" | "duration" | "createdAt";
export type SortDirection = "asc" | "desc";

export type TestAnswerValue =
  | string
  | string[]
  | Record<string, string>
  | null;

export type TestResultAnswer = {
  value: TestAnswerValue;
  checked?: boolean;
  updatedAt?: string;
};

export type TestResult = {
  id: string;
  testId: string;
  status: "in_progress" | "completed";
  answers: Record<string, TestResultAnswer>;
  currentQuestionId: string | null;
  answeredQuestionIds: string[];
  unansweredQuestionIds: string[];
  startedAt: string | null;
  completedAt: string | null;
  test: TestModel;
};

export type CurrentTestResultResponse = {
  hasSession: boolean;
  session: TestResult | null;
};

export const getTestQuestionsCount = (test: TestModel) => {
  return test.questions.length;
};

export const createDemoTest = (id: string): TestModel => ({
  id,
  authorId: "demo-author",
  title: "Черновик теста",
  description: "Тестовая модель для редактора вопросов.",
  questions: createDemoQuestions(20),
  estimatedPassTime: 20,
  rating: 0,
  passedCount: 0,
  createdAt: new Date().toISOString(),
  icon: "mdi:clipboard-text-outline",
});
