import type { TestAnswerValue } from "@/models/Test";
import type { TestQuestion } from "@/models/TestQuestion";

export type AnsweringFormProps<TQuestion extends TestQuestion = TestQuestion> = {
  question: TQuestion;
  value: TestAnswerValue;
  onChange: (value: TestAnswerValue) => void;
  showHint: boolean;
  showResult: boolean;
};

export const optionStateClass = (
  isCorrect: boolean,
  isSelected: boolean,
  showResult: boolean,
  showHint: boolean,
) => {
  if (showResult && isCorrect) {
    return "border-emerald-500/80 bg-emerald-500/10 text-emerald-100";
  }

  if (showResult && isSelected && !isCorrect) {
    return "border-red-500/80 bg-red-500/10 text-red-100";
  }

  if (showHint && isCorrect) {
    return "border-yellow-400/80 bg-yellow-400/10 text-yellow-100";
  }

  return isSelected
    ? "border-main-200 bg-main-700/70 text-main-50"
    : "border-main-700 bg-main-900/30 text-main-200 hover:border-main-500";
};
