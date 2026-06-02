"use client";

import { InputDropZone } from "@/components/atoms";
import type { TestQuestionBase } from "@/models/TestQuestion";
import {
  InputBig,
  InputCheckSlided,
} from "@kiyotakkkka/zvs-uikit-lib/ui";

type QuestionBaseFieldsProps<TQuestion extends TestQuestionBase> = {
  question: TQuestion;
  onChange: (question: TQuestion) => void;
};

export const QuestionBaseFields = <TQuestion extends TestQuestionBase>({
  question,
  onChange,
}: QuestionBaseFieldsProps<TQuestion>) => {
  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-3 border-b border-main-700/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-main-50">Видимость вопроса</p>
          <p className="mt-1 text-sm text-main-400">
            Если выключить, вопрос не будет отображаться в тесте.
          </p>
        </div>
        <InputCheckSlided
          checked={question.enabled}
          onChange={(enabled) => onChange({ ...question, enabled })}
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
          Текст вопроса
        </span>
        <InputBig
          value={question.text}
          placeholder="Введите формулировку вопроса..."
          onChange={(event) =>
            onChange({ ...question, text: event.target.value })
          }
          className="h-36 w-full resize-none px-3 py-2 text-sm"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
          Картинка
        </span>
        <InputDropZone
          file={question.image}
          previewUrl={question.imagePreviewUrl}
          onChange={(image, imagePreviewUrl) =>
            onChange({ ...question, image, imagePreviewUrl })
          }
        />
      </label>
    </section>
  );
};
