"use client";

import type { MatchingPair, MatchingQuestion } from "@/models/TestQuestion";
import { createQuestionId } from "@/models/TestQuestion";
import { Button, InputSmall } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { TestQuestionFormLayout } from "./TestQuestionFormLayout";

type MatchingQuestionFormProps = {
  question: MatchingQuestion;
  onChange: (question: MatchingQuestion) => void;
};

const createPair = (): MatchingPair => ({
  id: createQuestionId(),
  term: "",
  definition: "",
});

export const MatchingQuestionForm = ({
  question,
  onChange,
}: MatchingQuestionFormProps) => {
  const updatePair = (pairId: string, patch: Partial<MatchingPair>) => {
    onChange({
      ...question,
      pairs: question.pairs.map((pair) =>
        pair.id === pairId ? { ...pair, ...patch } : pair,
      ),
    });
  };

  return (
    <TestQuestionFormLayout
      title="Пары для соотнесения"
      description="Задайте термин слева и правильное определение справа."
      addLabel="Добавить пару"
      onAdd={() =>
        onChange({ ...question, pairs: [...question.pairs, createPair()] })
      }
    >
      {question.pairs.map((pair, index) => (
        <div
          key={pair.id}
          className="grid gap-3 rounded-md border border-main-700/70 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center"
        >
          <InputSmall
            value={pair.term}
            placeholder={`Термин ${index + 1}`}
            className="w-full"
            onChange={(event) =>
              updatePair(pair.id, { term: event.target.value })
            }
          />
          <InputSmall
            value={pair.definition}
            placeholder={`Определение ${index + 1}`}
            className="w-full"
            onChange={(event) =>
              updatePair(pair.id, { definition: event.target.value })
            }
          />
          <Button
            type="button"
            variant="danger"
            className="h-10 w-10 p-0"
            onClick={() =>
              onChange({
                ...question,
                pairs: question.pairs.filter(({ id }) => id !== pair.id),
              })
            }
            disabled={question.pairs.length <= 1}
          >
            <Icon icon="mdi:trash-can-outline" width={18} height={18} />
          </Button>
        </div>
      ))}
    </TestQuestionFormLayout>
  );
};
