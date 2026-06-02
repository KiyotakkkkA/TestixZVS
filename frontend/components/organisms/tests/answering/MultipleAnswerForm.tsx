"use client";

import type { MultipleQuestion } from "@/models/TestQuestion";
import type { AnsweringFormProps } from "./AnsweringTypes";
import { optionStateClass } from "./AnsweringTypes";
import { InputCheckBox } from "@kiyotakkkka/zvs-uikit-lib/ui";

export const MultipleAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: AnsweringFormProps<MultipleQuestion>) => {
  const selectedIds = Array.isArray(value) ? value : [];

  const toggleOption = (optionId: string) => {
    onChange(
      selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId],
    );
  };

  return (
    <div className="grid gap-3">
      {question.options.map((option) => {
        const isSelected = selectedIds.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            className={[
              "flex items-center gap-3 rounded-md border p-4 text-left transition",
              optionStateClass(option.isCorrect, isSelected, showResult, showHint),
            ].join(" ")}
          >
            <InputCheckBox
              checked={isSelected}
              onChange={() => toggleOption(option.id)}
            />
            <span className="text-sm font-semibold">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
};
