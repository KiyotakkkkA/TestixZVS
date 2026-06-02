"use client";

import { Button } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";

type TestEditNavPanelProps = {
  questionsCount: number;
  activeQuestionNumber?: number;
  onQuestionSelect: (questionNumber: number) => void;
  onQuestionCreate: () => void;
};

export const TestEditNavPanel = ({
  questionsCount,
  activeQuestionNumber,
  onQuestionSelect,
  onQuestionCreate,
}: TestEditNavPanelProps) => {
  const questionNumbers = Array.from(
    { length: questionsCount },
    (_, index) => index + 1,
  );
  const hasQuestions = questionNumbers.length > 0;

  return (
    <aside className="rounded-lg border border-main-700 bg-main-800/55 shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100vh-98px)] xl:overflow-auto">
      <div className="border-b border-main-700 p-4">
        <p className="inline-flex items-center gap-2 rounded bg-main-700/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-main-300">
          <Icon icon="mdi:format-list-numbered" width={16} height={16} />
          Вопросы
        </p>
        <h2 className="mt-3 text-lg font-extrabold text-main-50">Навигация</h2>
        <p className="mt-1 text-sm text-main-400">
          {hasQuestions
            ? `Всего вопросов: ${questionsCount}`
            : "В этом тесте пока нет вопросов"}
        </p>
      </div>

      <div className="p-4">
        {hasQuestions ? (
          <div className="grid grid-cols-7 gap-2">
            {questionNumbers.map((questionNumber) => {
              const isActive = activeQuestionNumber === questionNumber;

              return (
                <button
                  type="button"
                  key={questionNumber}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onQuestionSelect(questionNumber)}
                  className={[
                    "flex aspect-square items-center justify-center rounded-md border text-sm font-bold transition",
                    isActive
                      ? "border-main-50 bg-main-50 text-main-900 shadow-sm"
                      : "border-main-700 bg-main-900/35 text-main-200 hover:border-main-500 hover:bg-main-700/70",
                  ].join(" ")}
                >
                  {questionNumber}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-main-700 bg-main-900/35 p-4 text-sm text-main-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-main-700/80 text-main-100">
              <Icon icon="mdi:plus-box-outline" width={24} height={24} />
            </div>
            <p className="mt-3 font-semibold text-main-100">
              Вопросы ещё не добавлены
            </p>
            <p className="mt-1 leading-6 text-main-400">
              После создания первого вопроса здесь появится сетка.
            </p>
          </div>
        )}

        <Button
          variant="primary"
          className="mt-4 w-full gap-2 px-3 py-2"
          onClick={onQuestionCreate}
        >
          <Icon icon="mdi:plus" width={20} height={20} />
          Добавить вопрос
        </Button>
      </div>
    </aside>
  );
};
