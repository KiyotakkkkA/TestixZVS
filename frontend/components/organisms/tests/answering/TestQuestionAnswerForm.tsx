"use client";

import type { TestAnswerValue } from "@/models/Test";
import type { TestQuestion } from "@/models/TestQuestion";
import { MatchingAnswerForm } from "./MatchingAnswerForm";
import { MultipleAnswerForm } from "./MultipleAnswerForm";
import { SequentialAnswerForm } from "./SequentialAnswerForm";
import { SimpleAnswerForm } from "./SimpleAnswerForm";
import { TextAnswerForm } from "./TextAnswerForm";

type TestQuestionAnswerFormProps = {
  question: TestQuestion;
  value: TestAnswerValue;
  onChange: (value: TestAnswerValue) => void;
  showHint: boolean;
  showResult: boolean;
};

export const TestQuestionAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: TestQuestionAnswerFormProps) => {
  switch (question.type) {
    case "simple":
      return (
        <SimpleAnswerForm
          question={question}
          value={value}
          onChange={onChange}
          showHint={showHint}
          showResult={showResult}
        />
      );
    case "multiple":
      return (
        <MultipleAnswerForm
          question={question}
          value={value}
          onChange={onChange}
          showHint={showHint}
          showResult={showResult}
        />
      );
    case "matching":
      return (
        <MatchingAnswerForm
          question={question}
          value={value}
          onChange={onChange}
          showHint={showHint}
          showResult={showResult}
        />
      );
    case "text":
      return (
        <TextAnswerForm
          question={question}
          value={value}
          onChange={onChange}
          showHint={showHint}
          showResult={showResult}
        />
      );
    case "sequential":
      return (
        <SequentialAnswerForm
          question={question}
          value={value}
          onChange={onChange}
          showHint={showHint}
          showResult={showResult}
        />
      );
  }
};
