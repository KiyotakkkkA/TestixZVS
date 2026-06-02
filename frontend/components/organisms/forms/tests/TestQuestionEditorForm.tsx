"use client";

import type { TestQuestion, TestQuestionType } from "@/models/TestQuestion";
import {
  createEmptyQuestion,
  questionTypeLabels,
} from "@/models/TestQuestion";
import { Icon } from "@iconify/react";
import { Select } from "@kiyotakkkka/zvs-uikit-lib/ui";
import type { ReactNode } from "react";
import { MatchingQuestionForm } from "./MatchingQuestionForm";
import { MultipleQuestionForm } from "./MultipleQuestionForm";
import { QuestionBaseFields } from "./QuestionBaseFields";
import { SequentialQuestionForm } from "./SequentialQuestionForm";
import { SimpleQuestionForm } from "./SimpleQuestionForm";
import { TextQuestionForm } from "./TextQuestionForm";

type TestQuestionEditorFormProps = {
  question: TestQuestion;
  onChange: (question: TestQuestion) => void;
};

const typeOptions = (
  [
    ["simple", "mdi:radiobox-marked"],
    ["multiple", "mdi:checkbox-marked-outline"],
    ["matching", "mdi:vector-link"],
    ["text", "mdi:text-box-edit-outline"],
    ["sequential", "mdi:sort"],
  ] as [TestQuestionType, string][]
).map(([value, icon]) => ({
  value,
  label: questionTypeLabels[value],
  icon: <Icon icon={icon} />,
})) satisfies {
  value: TestQuestionType;
  label: string;
  icon: ReactNode;
}[];

const selectClassNames = {
  trigger:
    "h-11 w-full rounded border border-main-700 bg-main-900/70 px-3 text-sm text-main-100 outline-none transition hover:bg-main-900 focus:border-main-400",
  menu: "border border-main-700 bg-main-900 text-main-100",
  search: "border-main-700 bg-main-800 text-main-100 placeholder:text-main-500",
  option: "text-main-100 hover:bg-main-800",
  optionLabel: "text-sm",
};

export const TestQuestionEditorForm = ({
  question,
  onChange,
}: TestQuestionEditorFormProps) => {
  const handleTypeChange = (type: TestQuestionType) => {
    onChange({
      ...createEmptyQuestion(type),
      id: question.id,
      text: question.text,
      enabled: question.enabled,
      image: question.image,
      imagePreviewUrl: question.imagePreviewUrl,
    } as TestQuestion);
  };

  const renderTypeForm = () => {
    switch (question.type) {
      case "simple":
        return <SimpleQuestionForm question={question} onChange={onChange} />;
      case "multiple":
        return <MultipleQuestionForm question={question} onChange={onChange} />;
      case "matching":
        return <MatchingQuestionForm question={question} onChange={onChange} />;
      case "text":
        return <TextQuestionForm question={question} onChange={onChange} />;
      case "sequential":
        return (
          <SequentialQuestionForm question={question} onChange={onChange} />
        );
    }
  };

  return (
    <div className="grid gap-5">
      <section className="border-b border-main-700/70 pb-5">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
            Тип вопроса
          </span>
          <Select
            value={question.type}
            onChange={(type) => handleTypeChange(type as TestQuestionType)}
            options={typeOptions}
            className="w-full max-w-md"
            classNames={selectClassNames}
            menuWidth="auto"
          />
        </label>
      </section>

      <QuestionBaseFields question={question} onChange={onChange} />
      {renderTypeForm()}
    </div>
  );
};
