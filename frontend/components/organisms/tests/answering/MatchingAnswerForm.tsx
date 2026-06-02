"use client";

import type { MatchingPair, MatchingQuestion } from "@/models/TestQuestion";
import type { AnsweringFormProps } from "./AnsweringTypes";
import { Select } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";

type MatchingAnswerQuestion = MatchingQuestion & {
  definitions?: MatchingPair[];
};

const getRecordValue = (value: unknown): Record<string, string> => {
  return value && !Array.isArray(value) && typeof value === "object"
    ? (value as Record<string, string>)
    : {};
};

const selectClassNames = {
  trigger:
    "h-11 w-full rounded border border-main-700 bg-main-800 px-3 text-sm text-main-100 outline-none transition hover:bg-main-800/80 focus:border-main-400",
  menu: "border border-main-700 bg-main-900 text-main-100",
  search: "border-main-700 bg-main-800 text-main-100 placeholder:text-main-500",
  option: "text-main-100 hover:bg-main-800",
  optionLabel: "text-sm",
};

export const MatchingAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: AnsweringFormProps<MatchingQuestion>) => {
  const selectedDefinitions = getRecordValue(value);
  const definitions = ((question as MatchingAnswerQuestion).definitions ??
    question.pairs) as MatchingPair[];

  const updateDefinition = (termId: string, definitionId: string) => {
    onChange({
      ...selectedDefinitions,
      [termId]: definitionId,
    });
  };

  return (
    <div className="grid gap-3">
      {question.pairs.map((pair) => {
        const selectedDefinitionId = selectedDefinitions[pair.id] ?? "";
        const isCorrect = selectedDefinitionId === pair.id;
        const showCorrect = showHint || showResult;

        return (
          <div
            key={pair.id}
            className={[
              "grid gap-3 rounded-md border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
              showResult && isCorrect
                ? "border-emerald-500/70 bg-emerald-500/10"
                : showResult && selectedDefinitionId
                  ? "border-red-500/70 bg-red-500/10"
                  : "border-main-700 bg-main-900/30",
            ].join(" ")}
          >
            <div>
              <p className="text-xs font-bold uppercase text-main-400">Термин</p>
              <p className="mt-1 text-sm font-semibold text-main-50">
                {pair.term}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-main-400">
                Определение
              </p>
              <Select
                value={selectedDefinitionId}
                onChange={(value) => updateDefinition(pair.id, value)}
                options={definitions.map((definition) => ({
                  value: definition.id,
                  label: definition.definition,
                  icon: <Icon icon="mdi:link-variant" />,
                }))}
                placeholder="Выберите определение"
                className="mt-2 w-full"
                classNames={selectClassNames}
                menuWidth="auto"
              />
              {showCorrect && (
                <p className="mt-2 text-xs font-semibold text-emerald-200">
                  Верно: {pair.definition}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
