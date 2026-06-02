export type TestQuestionType =
  | "simple"
  | "multiple"
  | "matching"
  | "text"
  | "sequential";

export type TestQuestionBase = {
  id: string;
  type: TestQuestionType;
  text: string;
  enabled: boolean;
  image: File | null;
  imagePreviewUrl: string | null;
};

export type QuestionOption = {
  id: string;
  text: string;
};

export type MultipleQuestionOption = QuestionOption & {
  isCorrect: boolean;
};

export type MatchingPair = {
  id: string;
  term: string;
  definition: string;
};

export type SequentialBlock = {
  id: string;
  text: string;
};

export type SimpleQuestion = TestQuestionBase & {
  type: "simple";
  options: QuestionOption[];
  correctOptionId: string | null;
};

export type MultipleQuestion = TestQuestionBase & {
  type: "multiple";
  options: MultipleQuestionOption[];
};

export type MatchingQuestion = TestQuestionBase & {
  type: "matching";
  pairs: MatchingPair[];
};

export type TextQuestion = TestQuestionBase & {
  type: "text";
  correctAnswer: string;
};

export type SequentialQuestion = TestQuestionBase & {
  type: "sequential";
  blocks: SequentialBlock[];
};

export type TestQuestion =
  | SimpleQuestion
  | MultipleQuestion
  | MatchingQuestion
  | TextQuestion
  | SequentialQuestion;

export const questionTypeLabels: Record<TestQuestionType, string> = {
  simple: "Один вариант",
  multiple: "Несколько вариантов",
  matching: "Соотнесение",
  text: "Развёрнутый ответ",
  sequential: "Последовательность",
};

export const createQuestionId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createBaseQuestion = (
  type: TestQuestionType,
): TestQuestionBase => ({
  id: createQuestionId(),
  type,
  text: "",
  enabled: true,
  image: null,
  imagePreviewUrl: null,
});

const createOption = (text = ""): QuestionOption => ({
  id: createQuestionId(),
  text,
});

const createMultipleOption = (text = ""): MultipleQuestionOption => ({
  ...createOption(text),
  isCorrect: false,
});

const createMatchingPair = (
  term = "",
  definition = "",
): MatchingPair => ({
  id: createQuestionId(),
  term,
  definition,
});

const createSequentialBlock = (text = ""): SequentialBlock => ({
  id: createQuestionId(),
  text,
});

export const createEmptyQuestion = (
  type: TestQuestionType,
): TestQuestion => {
  const baseQuestion = createBaseQuestion(type);

  switch (type) {
    case "simple": {
      const options = [createOption(""), createOption("")];

      return {
        ...baseQuestion,
        type,
        options,
        correctOptionId: options[0].id,
      };
    }
    case "multiple":
      return {
        ...baseQuestion,
        type,
        options: [createMultipleOption(""), createMultipleOption("")],
      };
    case "matching":
      return {
        ...baseQuestion,
        type,
        pairs: [createMatchingPair(), createMatchingPair()],
      };
    case "text":
      return {
        ...baseQuestion,
        type,
        correctAnswer: "",
      };
    case "sequential":
      return {
        ...baseQuestion,
        type,
        blocks: [createSequentialBlock(""), createSequentialBlock("")],
      };
  }
};

export const createDemoQuestions = (count: number) => {
  const types: TestQuestionType[] = [
    "simple",
    "multiple",
    "matching",
    "text",
    "sequential",
  ];

  return Array.from({ length: count }, (_, index) =>
    createEmptyQuestion(types[index % types.length]),
  );
};
