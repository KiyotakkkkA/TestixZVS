"use client";

import type { TextQuestion } from "@/models/TestQuestion";
import type { AnsweringFormProps } from "./AnsweringTypes";
import { InputBig } from "@kiyotakkkka/zvs-uikit-lib/ui";

export const TextAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: AnsweringFormProps<TextQuestion>) => {
  const answer = typeof value === "string" ? value : "";

  return (
    <div className="grid gap-4">
      <InputBig
        value={answer}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Введите развёрнутый ответ..."
        className="min-h-40 w-full resize-none px-3 py-2 text-sm"
      />
      {(showHint || showResult) && (
        <div className="rounded-md border border-emerald-500/70 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Правильный ответ: {question.correctAnswer || "Не задан"}
        </div>
      )}
    </div>
  );
};
