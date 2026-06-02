"use client";

import { TestQuestionEditorForm } from "@/components/organisms/forms";
import { TestEditNavPanel } from "@/components/organisms/tests";
import type { TestModel } from "@/models/Test";
import { getTestQuestionsCount } from "@/models/Test";
import { createEmptyQuestion, type TestQuestion } from "@/models/TestQuestion";
import { DELETE, GET, POST, PUT } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import { Button, EmptyState, Modal } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import { Icon } from "@iconify/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type PendingAction = null | (() => void | Promise<void>);

type QuestionRequest = Omit<TestQuestion, "image"> & {
  image: null;
};

const getValidQuestionNumber = (
  rawQuestionNumber: string | null,
  maxQuestionNumber: number,
) => {
  const questionNumber = Number(rawQuestionNumber);

  if (!Number.isInteger(questionNumber) || questionNumber < 1) {
    return undefined;
  }

  if (maxQuestionNumber > 0 && questionNumber > maxQuestionNumber) {
    return undefined;
  }

  return questionNumber;
};

const toQuestionRequest = (question: TestQuestion): QuestionRequest => ({
  ...question,
  image: null,
});

const isQuestionDirty = (
  savedQuestion: TestQuestion | undefined,
  draftQuestion: TestQuestion | null,
) => {
  if (!savedQuestion || !draftQuestion) {
    return false;
  }

  return (
    JSON.stringify(toQuestionRequest(savedQuestion)) !==
    JSON.stringify(toQuestionRequest(draftQuestion))
  );
};

export default function TestWorkbenchPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toasts = useToasts();
  const [test, setTest] = useState<TestModel | null>(null);
  const [draftQuestion, setDraftQuestion] = useState<TestQuestion | null>(null);
  const [draftQuestionId, setDraftQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);

  const questions = test?.questions ?? [];
  const questionsCount = questions.length;
  const activeQuestionNumber = useMemo(
    () => getValidQuestionNumber(searchParams.get("q"), questionsCount),
    [questionsCount, searchParams],
  );
  const activeQuestionIndex = activeQuestionNumber
    ? activeQuestionNumber - 1
    : -1;
  const savedQuestion = questions[activeQuestionIndex];
  const effectiveDraftQuestion =
    savedQuestion && draftQuestionId === savedQuestion.id
      ? draftQuestion
      : savedQuestion
        ? structuredClone(savedQuestion)
        : null;
  const hasUnsavedChanges =
    draftQuestionId === savedQuestion?.id &&
    isQuestionDirty(savedQuestion, draftQuestion);

  useEffect(() => {
    let isActive = true;

    const loadTest = async () => {
      setLoading(true);
      setError(null);

      const response = await GET<TestModel>(
        endpoints.tests.detail(params.uuid),
      );

      if (!isActive) {
        return;
      }

      if (!response.ok) {
        setError(response.data.message);
        setLoading(false);
        return;
      }

      setTest(response.data);
      setLoading(false);
    };

    void loadTest();

    return () => {
      isActive = false;
    };
  }, [params.uuid]);

  useEffect(() => {
    if (test && questionsCount > 0 && !activeQuestionNumber) {
      router.replace(`/test/workbench/${params.uuid}?q=1`);
    }
  }, [activeQuestionNumber, params.uuid, questionsCount, router, test]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const runOrConfirm = (action: () => void | Promise<void>) => {
    if (!hasUnsavedChanges) {
      void action();
      return;
    }

    setPendingAction(() => action);
    setIsUnsavedModalOpen(true);
  };

  const replaceQuestionInState = (question: TestQuestion) => {
    setTest((currentTest) =>
      currentTest
        ? {
            ...currentTest,
            questions: currentTest.questions.map((currentQuestion) =>
              currentQuestion.id === question.id ? question : currentQuestion,
            ),
          }
        : currentTest,
    );
    setDraftQuestionId(question.id);
    setDraftQuestion(structuredClone(question));
  };

  const saveCurrentQuestion = async () => {
    if (!effectiveDraftQuestion) {
      return false;
    }

    setSaving(true);

    const response = await PUT<TestQuestion>(
      endpoints.tests.questions.update(params.uuid, effectiveDraftQuestion.id),
      toQuestionRequest(effectiveDraftQuestion),
    );

    setSaving(false);

    if (!response.ok) {
      toasts.danger({
        title: "Ошибка!",
        description: response.data.message,
      });
      return false;
    }

    replaceQuestionInState(response.data);
    toasts.success({
      title: "Готово!",
      description: "Вопрос сохранён.",
    });
    return true;
  };

  const handleCreateQuestion = async () => {
    const response = await POST<TestQuestion>(
      endpoints.tests.questions.create(params.uuid),
      toQuestionRequest(createEmptyQuestion("simple")),
    );

    if (!response.ok) {
      toasts.danger({
        title: "Ошибка!",
        description: response.data.message,
      });
      return;
    }

    setTest((currentTest) =>
      currentTest
        ? {
            ...currentTest,
            questions: [...currentTest.questions, response.data],
          }
        : currentTest,
    );
    router.push(`/test/workbench/${params.uuid}?q=${questionsCount + 1}`);
  };

  const handleDeleteQuestion = async () => {
    if (!savedQuestion) {
      return;
    }

    const response = await DELETE<{ message: string }>(
      endpoints.tests.questions.delete(params.uuid, savedQuestion.id),
    );

    if (!response.ok) {
      toasts.danger({
        title: "Ошибка!",
        description: response.data.message,
      });
      return;
    }

    const nextQuestions = questions.filter(({ id }) => id !== savedQuestion.id);
    setTest((currentTest) =>
      currentTest ? { ...currentTest, questions: nextQuestions } : currentTest,
    );
    setDraftQuestionId(null);
    setDraftQuestion(null);

    if (nextQuestions.length === 0) {
      router.push(`/test/workbench/${params.uuid}`);
    } else {
      router.push(
        `/test/workbench/${params.uuid}?q=${Math.min(
          activeQuestionNumber ?? 1,
          nextQuestions.length,
        )}`,
      );
    }
  };

  const handleConfirmSaveAndContinue = async () => {
    const action = pendingAction;
    const isSaved = await saveCurrentQuestion();

    if (!isSaved) {
      return;
    }

    setIsUnsavedModalOpen(false);
    setPendingAction(null);
    await action?.();
  };

  const handleDiscardAndContinue = async () => {
    const action = pendingAction;

    setDraftQuestionId(savedQuestion?.id ?? null);
    setDraftQuestion(savedQuestion ? structuredClone(savedQuestion) : null);
    setIsUnsavedModalOpen(false);
    setPendingAction(null);
    await action?.();
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 rounded-lg border border-main-700 bg-main-800/45 p-10 text-sm text-main-300">
          <Icon
            icon="mdi:loading"
            width={24}
            height={24}
            className="animate-spin"
          />
          Загружаем редактор теста...
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-5 sm:px-6 lg:px-8">
        <EmptyState
          icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
          className="bg-main-800/35 p-10"
          title="Тест не найден"
          description={error ?? "Не удалось загрузить тест."}
        />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-450 gap-5 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:max-w-[calc(100vw-4rem)]">
        <TestEditNavPanel
          questionsCount={questionsCount}
          activeQuestionNumber={activeQuestionNumber}
          onQuestionSelect={(questionNumber) =>
            runOrConfirm(() =>
              router.push(`/test/workbench/${params.uuid}?q=${questionNumber}`),
            )
          }
          onQuestionCreate={() => runOrConfirm(handleCreateQuestion)}
        />

        <section className="flex min-w-0 flex-col gap-5 xl:min-h-[calc(100vh-98px)]">
          <div className="rounded-lg border border-main-700 bg-main-800/55 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="mt-4 text-2xl font-extrabold leading-tight text-main-50 sm:text-3xl">
                  Редактор теста
                </h1>
                <p className="mt-2 text-sm text-main-300">
                  Вопросов: {getTestQuestionsCount(test)}
                </p>
                <p className="mt-2 break-all text-xs text-main-400">
                  UUID: {params.uuid}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="gap-2 px-3 py-1.5"
                  onClick={() => runOrConfirm(() => router.push("/"))}
                >
                  <Icon icon="mdi:arrow-left" width={18} height={18} />К
                  каталогу
                </Button>
                {savedQuestion && (
                  <Button
                    variant="danger"
                    className="gap-2 px-3 py-1.5"
                    onClick={() => runOrConfirm(handleDeleteQuestion)}
                  >
                    <Icon icon="mdi:trash-can-outline" width={18} height={18} />
                    Удалить
                  </Button>
                )}
                <Button
                  variant={saving ? "secondary" : "primary"}
                  className="gap-2 px-3 py-1.5"
                  disabled={!hasUnsavedChanges || saving}
                  onClick={saveCurrentQuestion}
                >
                  <Icon
                    icon="mdi:content-save-outline"
                    width={18}
                    height={18}
                  />
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </div>
          </div>

          {questionsCount === 0 ? (
            <section className="rounded-lg border border-main-700 bg-main-800/45 p-6 shadow-sm">
              <div className="flex min-h-105 flex-col items-center justify-center rounded-lg border border-dashed border-main-700 bg-main-900/35 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-main-700/80 text-main-100 ring-1 ring-main-600">
                  <Icon
                    icon="mdi:comment-question-outline"
                    width={36}
                    height={36}
                  />
                </div>
                <h2 className="mt-5 text-2xl font-extrabold text-main-50">
                  Вопросов пока нет
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-main-300">
                  Создайте первый вопрос...
                </p>
                <Button
                  variant="primary"
                  className="mt-5 gap-2 px-4 py-2"
                  onClick={() => runOrConfirm(handleCreateQuestion)}
                >
                  <Icon icon="mdi:plus" width={20} height={20} />
                  Добавить первый вопрос
                </Button>
              </div>
            </section>
          ) : effectiveDraftQuestion ? (
            <section className="flex flex-1 flex-col rounded-lg border border-main-700 bg-main-800/45 shadow-sm">
              <div className="border-b border-main-700 p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-main-400">
                  Вопрос {activeQuestionNumber}
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-main-50">
                  Настройка вопроса
                </h2>
              </div>

              <div className="grid flex-1 content-start gap-5 p-5">
                <TestQuestionEditorForm
                  question={effectiveDraftQuestion}
                  onChange={(question) => {
                    setDraftQuestionId(question.id);
                    setDraftQuestion(question);
                  }}
                />
              </div>
            </section>
          ) : null}
        </section>
      </div>

      <Modal
        open={isUnsavedModalOpen}
        onClose={() => setIsUnsavedModalOpen(false)}
        className="w-[min(520px,calc(100vw-2rem))]"
      >
        <Modal.Header>Есть несохранённые изменения</Modal.Header>
        <Modal.Content className="space-y-3 text-sm text-main-300">
          <p>
            Сохраните текущий вопрос или сбросьте изменения, прежде чем
            продолжить. Несохранённые изменения будут потеряны.
          </p>
        </Modal.Content>
        <Modal.Footer className="flex flex-wrap justify-end gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5"
            onClick={() => setIsUnsavedModalOpen(false)}
          >
            Остаться
          </Button>
          <Button
            variant="danger"
            className="px-3 py-1.5"
            onClick={handleDiscardAndContinue}
          >
            Не сохранять
          </Button>
          <Button
            variant={saving ? "secondary" : "primary"}
            className="px-3 py-1.5"
            disabled={saving}
            onClick={handleConfirmSaveAndContinue}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}
