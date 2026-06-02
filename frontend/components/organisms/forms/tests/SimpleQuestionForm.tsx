"use client";

import type { QuestionOption, SimpleQuestion } from "@/models/TestQuestion";
import { createQuestionId } from "@/models/TestQuestion";
import { Button, InputRadio, InputSmall } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { TestQuestionFormLayout } from "./TestQuestionFormLayout";

type SimpleQuestionFormProps = {
  question: SimpleQuestion;
  onChange: (question: SimpleQuestion) => void;
};

const createOption = (): QuestionOption => ({
  id: createQuestionId(),
  text: "",
});

export const SimpleQuestionForm = ({
  question,
  onChange,
}: SimpleQuestionFormProps) => {
  const updateOptionText = (optionId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, text } : option,
      ),
    });
  };

  const removeOption = (optionId: string) => {
    const options = question.options.filter((option) => option.id !== optionId);
    const correctOptionId =
      question.correctOptionId === optionId
        ? (options[0]?.id ?? null)
        : question.correctOptionId;

    onChange({ ...question, options, correctOptionId });
  };

  return (
    <TestQuestionFormLayout
      title="Варианты ответа"
      description="Выберите ровно один правильный вариант через радио-кнопку."
      addLabel="Добавить вариант"
      onAdd={() =>
        onChange({
          ...question,
          options: [...question.options, createOption()],
        })
      }
    >
      {question.options.map((option, index) => (
        <div
          key={option.id}
          className="grid gap-3 rounded-md border border-main-700/70 p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
        >
          <InputRadio
            name={`simple-${question.id}`}
            checked={question.correctOptionId === option.id}
            onChange={() =>
              onChange({ ...question, correctOptionId: option.id })
            }
          />
          <InputSmall
            value={option.text}
            placeholder={`Вариант ${index + 1}`}
            className="w-full"
            onChange={(event) =>
              updateOptionText(option.id, event.target.value)
            }
          />
          <Button
            type="button"
            variant="danger"
            className="h-10 w-10 p-0"
            onClick={() => removeOption(option.id)}
            disabled={question.options.length <= 1}
          >
            <Icon icon="mdi:trash-can-outline" width={18} height={18} />
          </Button>
        </div>
      ))}
    </TestQuestionFormLayout>
  );
};
