"use client";

import type {
  MultipleQuestion,
  MultipleQuestionOption,
} from "@/models/TestQuestion";
import { createQuestionId } from "@/models/TestQuestion";
import {
  Button,
  InputCheckBox,
  InputSmall,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { TestQuestionFormLayout } from "./TestQuestionFormLayout";

type MultipleQuestionFormProps = {
  question: MultipleQuestion;
  onChange: (question: MultipleQuestion) => void;
};

const createOption = (): MultipleQuestionOption => ({
  id: createQuestionId(),
  text: "",
  isCorrect: false,
});

export const MultipleQuestionForm = ({
  question,
  onChange,
}: MultipleQuestionFormProps) => {
  const updateOption = (
    optionId: string,
    patch: Partial<MultipleQuestionOption>,
  ) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option,
      ),
    });
  };

  return (
    <TestQuestionFormLayout
      title="Варианты ответа"
      description="Отметьте все правильные варианты через чекбоксы."
      addLabel="Добавить вариант"
      onAdd={() =>
        onChange({ ...question, options: [...question.options, createOption()] })
      }
    >
      {question.options.map((option, index) => (
        <div
          key={option.id}
          className="grid gap-3 rounded-md border border-main-700/70 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
        >
          <InputCheckBox
            checked={option.isCorrect}
            onChange={(isCorrect) => updateOption(option.id, { isCorrect })}
          />
          <InputSmall
            value={option.text}
            placeholder={`Вариант ${index + 1}`}
            className="w-full"
            onChange={(event) =>
              updateOption(option.id, { text: event.target.value })
            }
          />
          <Button
            type="button"
            variant="danger"
            className="h-10 w-10 p-0"
            onClick={() =>
              onChange({
                ...question,
                options: question.options.filter(({ id }) => id !== option.id),
              })
            }
            disabled={question.options.length <= 1}
          >
            <Icon icon="mdi:trash-can-outline" width={18} height={18} />
          </Button>
        </div>
      ))}
    </TestQuestionFormLayout>
  );
};
