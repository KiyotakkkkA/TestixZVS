"use client";

import type {
  CurrentTestResultResponse,
  TestAnswerValue,
  TestResult,
} from "@/models/Test";
import type {
  MatchingQuestion,
  MultipleQuestion,
  SequentialQuestion,
  SimpleQuestion,
  TestQuestion,
  TextQuestion,
} from "@/models/TestQuestion";
import { TestQuestionAnswerForm } from "@/components/organisms/tests";
import { GET, POST, PUT } from "@/services/api";
import { endpoints, LARAVEL_ORIGIN } from "@/services/endpoints";
import { Button, EmptyState, Modal } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const settingsStorageKeys = {
  timeLimit: "zvs.test_settings.time_limit",
  showTips: "zvs.test_settings.show_tips",
  autoCheck: "zvs.test_settings.auto_check",
};

const readBooleanSetting = (key: string, defaultValue: boolean) => {
  const value = window.localStorage.getItem(key);
  return value === null ? defaultValue : value === "true";
};

const readTimeLimitSetting = () => {
  const value = window.localStorage.getItem(settingsStorageKeys.timeLimit);

  if (!value) {
    return { enabled: false, minutes: 20 };
  }

  try {
    const parsed = JSON.parse(value) as { enabled?: boolean; minutes?: number };

    return {
      enabled: Boolean(parsed.enabled),
      minutes: typeof parsed.minutes === "number" ? parsed.minutes : 20,
    };
  } catch {
    return { enabled: false, minutes: 20 };
  }
};

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
};

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

const getInitialAnswer = (question: TestQuestion): TestAnswerValue => {
  if (question.type === "multiple" || question.type === "sequential") {
    return question.type === "sequential"
      ? (question as SequentialQuestion).blocks.map(({ id }) => id)
      : [];
  }

  if (question.type === "matching") {
    return {};
  }

  return "";
};

const getQuestionNumber = (rawQuestionNumber: string | null, total: number) => {
  const questionNumber = Number(rawQuestionNumber);

  if (!Number.isInteger(questionNumber) || questionNumber < 1) {
    return 1;
  }

  return Math.min(questionNumber, Math.max(total, 1));
};

const getImageSrc = (imagePreviewUrl: string | null) => {
  if (!imagePreviewUrl) {
    return null;
  }

  if (imagePreviewUrl.startsWith("/storage/")) {
    return `${LARAVEL_ORIGIN}${imagePreviewUrl}`;
  }

  return imagePreviewUrl;
};

export default function TestProgressPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [answerDraft, setAnswerDraft] = useState<{
    questionId: string;
    value: TestAnswerValue;
    showHint: boolean;
    showResult: boolean;
  } | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = result?.test.questions ?? [];
  const currentQuestionNumber = getQuestionNumber(
    searchParams.get("q"),
    questions.length,
  );
  const currentQuestion = questions[currentQuestionNumber - 1];
  const savedAnswer = currentQuestion
    ? result?.answers[currentQuestion.id]
    : null;
  const isDraftForCurrentQuestion =
    Boolean(currentQuestion) && answerDraft?.questionId === currentQuestion?.id;
  const answerValue = isDraftForCurrentQuestion
    ? answerDraft?.value
    : currentQuestion
      ? (savedAnswer?.value ?? getInitialAnswer(currentQuestion))
      : null;
  const showHint = isDraftForCurrentQuestion ? answerDraft?.showHint : false;
  const showResult =
    Boolean(savedAnswer?.checked) ||
    (isDraftForCurrentQuestion ? answerDraft?.showResult : false);
  const isChecked = showResult;

  useEffect(() => {
    let isActive = true;

    const loadSession = async () => {
      setLoading(true);
      setError(null);

      const response = await GET<CurrentTestResultResponse>(
        endpoints.tests.results.current(params.uuid),
      );

      if (!isActive) {
        return;
      }

      if (!response.ok || !response.data.hasSession || !response.data.session) {
        router.replace(`/test/${params.uuid}`);
        return;
      }

      const timeLimit = readTimeLimitSetting();
      setShowTips(readBooleanSetting(settingsStorageKeys.showTips, true));
      setAutoCheck(readBooleanSetting(settingsStorageKeys.autoCheck, false));
      setResult(response.data.session);

      if (timeLimit.enabled && response.data.session.startedAt) {
        const startedAt = new Date(response.data.session.startedAt).getTime();
        const endsAt = startedAt + timeLimit.minutes * 60 * 1000;
        setSecondsLeft(Math.max(Math.ceil((endsAt - Date.now()) / 1000), 0));
      }

      setLoading(false);
    };

    void loadSession();

    return () => {
      isActive = false;
    };
  }, [params.uuid, router]);

  useEffect(() => {
    if (secondsLeft === null) {
      return;
    }

    if (secondsLeft <= 0 && result) {
      void POST<TestResult>(
        endpoints.tests.results.complete(params.uuid, result.id),
      ).then((response) => {
        if (response.ok) {
          setResult(response.data);
          router.replace(`/test/${params.uuid}/results`);
        }
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => (current === null ? null : current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [params.uuid, result, router, secondsLeft]);

  const saveAnswer = async (checked = false) => {
    if (!result || !currentQuestion) {
      return null;
    }

    setSaving(true);

    const response = await PUT<TestResult>(
      endpoints.tests.results.answer(params.uuid, result.id),
      {
        questionId: currentQuestion.id,
        answer: answerValue,
        checked,
      },
    );

    setSaving(false);

    if (!response.ok) {
      setError(response.data.message);
      return null;
    }

    setResult(response.data);
    setAnswerDraft(null);
    return response.data;
  };

  const goToQuestion = async (questionNumber: number) => {
    await saveAnswer(showResult);
    router.push(`/test/${params.uuid}/progress?q=${questionNumber}`);
  };

  const goNext = async () => {
    await saveAnswer(showResult);

    if (currentQuestionNumber >= questions.length && result) {
      const response = await POST<TestResult>(
        endpoints.tests.results.complete(params.uuid, result.id),
      );

      if (response.ok) {
        setResult(response.data);
        router.push(`/test/${params.uuid}/results`);
      }
      return;
    }

    router.push(`/test/${params.uuid}/progress?q=${currentQuestionNumber + 1}`);
  };

  const handleMainAction = async () => {
    if (autoCheck && !showResult) {
      if (currentQuestion) {
        setAnswerDraft({
          questionId: currentQuestion.id,
          value: answerValue,
          showHint: Boolean(showHint),
          showResult: true,
        });
      }
      await saveAnswer(true);
      return;
    }

    await goNext();
  };

  const answeredIds = useMemo(() => {
    return new Set(
      Object.entries(result?.answers ?? {})
        .filter(([, answer]) => isAnsweredValue(answer.value))
        .map(([questionId]) => questionId),
    );
  }, [result?.answers]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10 text-main-300">
        <Icon
          icon="mdi:loading"
          width={24}
          height={24}
          className="animate-spin"
        />
        <span className="ml-3">Загружаем прохождение...</span>
      </main>
    );
  }

  if (error || !result || !currentQuestion) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
        <EmptyState
          icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
          className="w-full max-w-lg bg-main-800/35 p-10"
          title="Прохождение недоступно"
          description={error ?? "Не удалось открыть текущий вопрос."}
        />
      </main>
    );
  }

  const correct = isAnswerCorrect(currentQuestion, answerValue);
  const questionImageSrc = getImageSrc(currentQuestion.imagePreviewUrl);

  return (
    <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-main-700 bg-main-800/55 p-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-main-400">
                Навигация
              </p>
              <p className="mt-1 text-sm text-main-300">
                {answeredIds.size} / {questions.length} отвечено
              </p>
            </div>
            {secondsLeft !== null && (
              <span className="rounded bg-main-50 px-3 py-1 text-sm font-extrabold text-main-900">
                {formatTime(secondsLeft)}
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-[repeat(auto-fill,44px)] gap-3">
            {questions.map((question, index) => {
              const questionNumber = index + 1;
              const active = questionNumber === currentQuestionNumber;
              const answered = answeredIds.has(question.id);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => void goToQuestion(questionNumber)}
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border text-md font-bold transition",
                    active
                      ? "border-main-50 bg-main-50 text-main-900 ring-2 ring-inset ring-main-400"
                      : answered
                        ? "border-main-50 bg-main-50 text-main-900"
                        : "border-main-700 bg-main-900/35 text-main-200 hover:border-main-500",
                  ].join(" ")}
                >
                  {questionNumber}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-2 border-t border-main-700 pt-4 text-xs text-main-400">
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-main-50 bg-main-50" />
              Отвечен
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-main-700 bg-main-900/35" />
              Без ответа
            </span>
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border border-main-50 bg-main-50 ring-2 ring-inset ring-main-400" />
              Текущий вопрос
            </span>
          </div>
        </aside>

        <section className="rounded-lg border border-main-700 bg-main-800/55 shadow-2xl shadow-black/30">
          <div className="border-b border-main-700 p-5">
            <p className="text-sm font-bold uppercase text-main-400">
              Вопрос {currentQuestionNumber} из {questions.length}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-main-50">
              {currentQuestion.text || "Без текста вопроса"}
            </h1>
            {questionImageSrc && (
              <div className="mt-5 overflow-hidden rounded-lg border border-main-700 bg-main-900/35">
                <div className="flex items-center justify-between gap-3 border-b border-main-700 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-main-400">
                    Изображение
                  </p>
                  <Button
                    variant="secondary"
                    className="gap-2 p-2"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <Icon icon="mdi:arrow-expand" width={18} height={18} />
                  </Button>
                </div>
                <button
                  type="button"
                  className="block max-h-80 w-full overflow-hidden bg-main-950/30"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={questionImageSrc}
                    alt="Изображение к вопросу"
                    className="mx-auto max-h-80 w-full object-contain"
                  />
                </button>
              </div>
            )}
            {isChecked && (
              <p
                className={[
                  "mt-3 text-sm font-bold",
                  correct ? "text-emerald-300" : "text-red-300",
                ].join(" ")}
              >
                {correct ? "Ответ верный" : "Ответ неверный"}
              </p>
            )}
          </div>

          <div className="grid gap-5 p-5">
            <TestQuestionAnswerForm
              question={currentQuestion}
              value={answerValue}
              onChange={(value) =>
                setAnswerDraft({
                  questionId: currentQuestion.id,
                  value,
                  showHint: Boolean(showHint),
                  showResult: Boolean(showResult),
                })
              }
              showHint={Boolean(showHint)}
              showResult={isChecked}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-1.5"
                disabled={currentQuestionNumber <= 1 || saving}
                onClick={() => void goToQuestion(currentQuestionNumber - 1)}
              >
                Предыдущий
              </Button>

              <div className="flex flex-col gap-2 sm:flex-row">
                {showTips && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1.5"
                    onClick={() =>
                      setAnswerDraft({
                        questionId: currentQuestion.id,
                        value: answerValue,
                        showHint: true,
                        showResult: Boolean(showResult),
                      })
                    }
                  >
                    Подсказать
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  className="px-3 py-1.5"
                  disabled={saving || result.status === "completed"}
                  onClick={handleMainAction}
                >
                  {autoCheck && !showResult
                    ? "Проверить"
                    : currentQuestionNumber >= questions.length
                      ? "Завершить"
                      : "Далее"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        className="w-[min(1100px,calc(100vw-2rem))]"
      >
        <Modal.Header>Изображение к вопросу</Modal.Header>
        <Modal.Content>
          {questionImageSrc && (
            <div className="max-h-[75vh] overflow-auto rounded-md bg-main-950/50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={questionImageSrc}
                alt="Изображение к вопросу"
                className="mx-auto h-auto max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>
          )}
        </Modal.Content>
        <Modal.Footer className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5"
            onClick={() => setIsImageModalOpen(false)}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
