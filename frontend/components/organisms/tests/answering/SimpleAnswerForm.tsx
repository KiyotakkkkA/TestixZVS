"use client";

import type { SimpleQuestion } from "@/models/TestQuestion";
import type { AnsweringFormProps } from "./AnsweringTypes";
import { optionStateClass } from "./AnsweringTypes";
import { InputRadio } from "@kiyotakkkka/zvs-uikit-lib/ui";

export const SimpleAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: AnsweringFormProps<SimpleQuestion>) => {
  const selectedId = typeof value === "string" ? value : null;

  return (
    <div className="grid gap-3">
      {question.options.map((option) => {
        const isSelected = selectedId === option.id;
        const isCorrect = question.correctOptionId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "flex items-center gap-3 rounded-md border p-4 text-left transition",
              optionStateClass(isCorrect, isSelected, showResult, showHint),
            ].join(" ")}
          >
            <InputRadio
              name={`answer-${question.id}`}
              checked={isSelected}
              onChange={() => onChange(option.id)}
            />
            <span className="text-sm font-semibold">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
};
