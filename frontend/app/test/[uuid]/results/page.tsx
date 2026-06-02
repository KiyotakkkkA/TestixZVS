"use client";

import type { CurrentTestResultResponse, TestAnswerValue } from "@/models/Test";
import type {
  MatchingQuestion,
  MultipleQuestion,
  SequentialQuestion,
  SimpleQuestion,
  TestQuestion,
  TextQuestion,
} from "@/models/TestQuestion";
import { GET } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { Button, EmptyState } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const showStatsStorageKey = "zvs.test_settings.show_stats";

const normalizeArray = (value: string[]) => [...value].sort().join("|");

const isAnsweredValue = (value: TestAnswerValue) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => item.trim().length > 0);
  }

  return false;
};

const isAnswerCorrect = (question: TestQuestion, value: TestAnswerValue) => {
  switch (question.type) {
    case "simple":
      return value === (question as SimpleQuestion).correctOptionId;
    case "multiple": {
      const selectedIds = Array.isArray(value) ? value : [];
      const correctIds = (question as MultipleQuestion).options
        .filter(({ isCorrect }) => isCorrect)
        .map(({ id }) => id);

      return normalizeArray(selectedIds) === normalizeArray(correctIds);
    }
    case "matching": {
      const selected =
        value && !Array.isArray(value) && typeof value === "object"
          ? (value as Record<string, string>)
          : {};

      return (question as MatchingQuestion).pairs.every(
        ({ id }) => selected[id] === id,
      );
    }
    case "text": {
      const answer = typeof value === "string" ? value : "";

      return (
        answer.trim().toLowerCase() ===
        (question as TextQuestion).correctAnswer.trim().toLowerCase()
      );
    }
    case "sequential": {
      const selectedIds = Array.isArray(value) ? value : [];
      const correctIds = (question as SequentialQuestion).blocks.map(
        ({ id }) => id,
      );

      return selectedIds.join("|") === correctIds.join("|");
    }
  }
};

const getCorrectAnswerLabel = (question: TestQuestion) => {
  switch (question.type) {
    case "simple": {
      const correctOption = question.options.find(
        ({ id }) => id === question.correctOptionId,
      );

      return correctOption?.text || "Не задан";
    }
    case "multiple":
      return (
        question.options
          .filter(({ isCorrect }) => isCorrect)
          .map(({ text }) => text)
          .join(", ") || "Не задан"
      );
    case "matching":
      return (
        question.pairs
          .map(({ term, definition }) => `${term} — ${definition}`)
          .join("; ") || "Не задан"
      );
    case "text":
      return question.correctAnswer || "Не задан";
    case "sequential":
      return question.blocks.map(({ text }) => text).join(" → ") || "Не задан";
  }
};

export default function TestResultsPage() {
  const params = useParams<{ uuid: string }>();
  const [data, setData] = useState<CurrentTestResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadResult = async () => {
      setLoading(true);
      setError(null);
      setShowStats(window.localStorage.getItem(showStatsStorageKey) === "true");

      const response = await GET<CurrentTestResultResponse>(
        endpoints.tests.results.latest(params.uuid),
      );

      if (!isActive) {
        return;
      }

      if (!response.ok) {
        setError(response.data.message);
      } else {
        setData(response.data);
      }

      setLoading(false);
    };

    void loadResult();

    return () => {
      isActive = false;
    };
  }, [params.uuid]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10 text-main-300">
        <Icon
          icon="mdi:loading"
          width={24}
          height={24}
          className="animate-spin"
        />
        <span className="ml-3">Загружаем результат...</span>
      </main>
    );
  }

  if (error || !data?.session) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
        <EmptyState
          icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
          className="w-full max-w-lg bg-main-800/35 p-10"
          title="Результат не найден"
          description={error ?? "Для этого теста пока нет прохождений."}
        />
      </main>
    );
  }

  const result = data.session;
  const answeredCount = Object.values(result.answers).filter((answer) => {
    const value = answer.value;

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value && typeof value === "object") {
      return Object.values(value).some((item) => item.trim().length > 0);
    }

    return false;
  }).length;

  return (
    <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
      <section className="w-full max-w-4xl rounded-lg border border-main-700 bg-main-800/70 p-6 shadow-2xl shadow-black/35">
        <p className="text-xs font-bold uppercase tracking-wide text-main-400">
          Результат теста
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-main-50">
          {result.test.title}
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-main-900/35 p-4">
            <p className="text-xs text-main-400">Статус</p>
            <p className="mt-1 text-sm font-bold text-main-50">
              {result.status === "completed" ? "Завершён" : "В процессе"}
            </p>
          </div>
          <div className="rounded-md bg-main-900/35 p-4">
            <p className="text-xs text-main-400">Отвечено</p>
            <p className="mt-1 text-sm font-bold text-main-50">
              {answeredCount} / {result.test.questions.length}
            </p>
          </div>
          <div className="rounded-md bg-main-900/35 p-4">
            <p className="text-xs text-main-400">Начат</p>
            <p className="mt-1 text-sm font-bold text-main-50">
              {result.startedAt
                ? new Intl.DateTimeFormat("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(result.startedAt))
                : "-"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/" className="w-full">
            <Button variant="secondary" className="w-full px-3 py-1.5">
              К каталогу
            </Button>
          </Link>
          <Link href={`/test/${params.uuid}`} className="w-full">
            <Button variant="primary" className="w-full px-3 py-1.5">
              Пройти снова
            </Button>
          </Link>
        </div>

        {showStats && (
          <div className="mt-6 border-t border-main-700 pt-5">
            <h2 className="text-lg font-extrabold text-main-50">Ответы</h2>
            <div className="mt-4 grid gap-3">
              {result.test.questions.map((question, index) => {
                const answer = result.answers[question.id];
                const answered = answer ? isAnsweredValue(answer.value) : false;
                const correct = answer
                  ? isAnswerCorrect(question, answer.value)
                  : false;

                return (
                  <article
                    key={question.id}
                    className="rounded-md border border-main-700 bg-main-900/35 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase text-main-400">
                          Вопрос {index + 1}
                        </p>
                        <h3 className="mt-1 text-sm font-bold text-main-50">
                          {question.text || "Без текста вопроса"}
                        </h3>
                      </div>
                      <span
                        className={[
                          "w-fit rounded px-2 py-1 text-xs font-bold",
                          !answered
                            ? "bg-main-700 text-main-200"
                            : correct
                              ? "bg-emerald-500/15 text-emerald-200"
                              : "bg-red-500/15 text-red-200",
                        ].join(" ")}
                      >
                        {!answered
                          ? "Без ответа"
                          : correct
                            ? "Правильно"
                            : "Неправильно"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-main-300">
                      Правильный ответ:{" "}
                      <span className="font-semibold text-main-50">
                        {getCorrectAnswerLabel(question)}
                      </span>
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
