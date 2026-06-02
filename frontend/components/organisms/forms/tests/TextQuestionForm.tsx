"use client";

import type { TextQuestion } from "@/models/TestQuestion";
import { InputBig } from "@kiyotakkkka/zvs-uikit-lib/ui";

type TextQuestionFormProps = {
  question: TextQuestion;
  onChange: (question: TextQuestion) => void;
};

export const TextQuestionForm = ({
  question,
  onChange,
}: TextQuestionFormProps) => {
  return (
    <section className="border-t border-main-700/70 pt-5">
      <h3 className="text-base font-extrabold text-main-50">
        Правильный ответ
      </h3>
      <p className="mt-1 text-sm leading-6 text-main-400">
        Заполните эталонный развёрнутый ответ.
      </p>
      <InputBig
        value={question.correctAnswer ?? ""}
        placeholder="Введите правильный ответ..."
        onChange={(event) =>
          onChange({ ...question, correctAnswer: event.target.value })
        }
        className="mt-4 h-40 w-full resize-none px-3 py-2 text-sm"
      />
    </section>
  );
};
