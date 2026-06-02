"use client";

import type { CurrentTestResultResponse, TestModel, TestResult } from "@/models/Test";
import { getTestQuestionsCount } from "@/models/Test";
import { GET, POST } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import {
  Button,
  EmptyState,
  InputCheckSlided,
  InputSlider,
  SlidedPanel,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TestMetric = ({ icon, label }: { icon: string; label: string }) => (
  <span className="flex min-h-14 items-center gap-3 rounded-md border border-main-700/80 bg-main-900/35 px-4 py-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-main-700/70 text-main-200">
      <Icon icon={icon} width={18} height={18} />
    </span>
    <span className="text-sm font-bold text-main-50">{label}</span>
  </span>
);

const settingsStorageKeys = {
  timeLimit: "zvs.test_settings.time_limit",
  showTips: "zvs.test_settings.show_tips",
  autoCheck: "zvs.test_settings.auto_check",
  showStats: "zvs.test_settings.show_stats",
};

const defaultTimeLimit = {
  enabled: false,
  minutes: 20,
};

const readBooleanSetting = (key: string, defaultValue: boolean) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const value = window.localStorage.getItem(key);

  if (value === null) {
    return defaultValue;
  }

  return value === "true";
};

const readTimeLimitSetting = () => {
  if (typeof window === "undefined") {
    return defaultTimeLimit;
  }

  const value = window.localStorage.getItem(settingsStorageKeys.timeLimit);

  if (!value) {
    return defaultTimeLimit;
  }

  try {
    const parsedValue = JSON.parse(value) as Partial<typeof defaultTimeLimit>;

    return {
      enabled: Boolean(parsedValue.enabled),
      minutes:
        typeof parsedValue.minutes === "number"
          ? parsedValue.minutes
          : defaultTimeLimit.minutes,
    };
  } catch {
    return defaultTimeLimit;
  }
};

const writeBooleanSetting = (key: string, value: boolean) => {
  window.localStorage.setItem(key, String(value));
};

const writeTimeLimitSetting = (value: typeof defaultTimeLimit) => {
  window.localStorage.setItem(
    settingsStorageKeys.timeLimit,
    JSON.stringify(value),
  );
};

export default function TestPreviewPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timeLimit, setTimeLimit] = useState(defaultTimeLimit);
  const [showTips, setShowTips] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [starting, setStarting] = useState(false);

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

      const currentResponse = await GET<CurrentTestResultResponse>(
        endpoints.tests.results.current(params.uuid),
      );

      if (
        isActive &&
        currentResponse.ok &&
        currentResponse.data.hasSession &&
        currentResponse.data.session
      ) {
        const currentQuestionIndex = currentResponse.data.session.test.questions.findIndex(
          ({ id }) => id === currentResponse.data.session?.currentQuestionId,
        );

        router.replace(
          `/test/${params.uuid}/progress?q=${Math.max(currentQuestionIndex + 1, 1)}`,
        );
        return;
      }

      setLoading(false);
    };

    void loadTest();

    return () => {
      isActive = false;
    };
  }, [params.uuid, router]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
        <div className="flex items-center justify-center gap-3 rounded-lg border border-main-700 bg-main-800/55 p-8 text-sm text-main-300 shadow-2xl">
          <Icon
            icon="mdi:loading"
            width={24}
            height={24}
            className="animate-spin"
          />
          Загружаем тест...
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
        <EmptyState
          icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
          className="w-full max-w-lg bg-main-800/35 p-10"
          title="Тест не найден"
          description={error ?? "Не удалось загрузить данные теста."}
        />
      </main>
    );
  }

  const questionsCount = getTestQuestionsCount(test);

  const openSettings = () => {
    setTimeLimit(readTimeLimitSetting());
    setShowTips(readBooleanSetting(settingsStorageKeys.showTips, true));
    setAutoCheck(readBooleanSetting(settingsStorageKeys.autoCheck, false));
    setShowStats(readBooleanSetting(settingsStorageKeys.showStats, false));
    setIsSettingsOpen(true);
  };

  const updateTimeLimit = (nextTimeLimit: typeof defaultTimeLimit) => {
    setTimeLimit(nextTimeLimit);
    writeTimeLimitSetting(nextTimeLimit);
  };

  const updateShowTips = (nextShowTips: boolean) => {
    setShowTips(nextShowTips);
    writeBooleanSetting(settingsStorageKeys.showTips, nextShowTips);
  };

  const updateAutoCheck = (nextAutoCheck: boolean) => {
    setAutoCheck(nextAutoCheck);
    writeBooleanSetting(settingsStorageKeys.autoCheck, nextAutoCheck);
  };

  const updateShowStats = (nextShowStats: boolean) => {
    setShowStats(nextShowStats);
    writeBooleanSetting(settingsStorageKeys.showStats, nextShowStats);
  };

  const startTest = async () => {
    setStarting(true);

    const response = await POST<TestResult>(
      endpoints.tests.results.start(params.uuid),
    );

    setStarting(false);

    if (!response.ok) {
      setError(response.data.message);
      return;
    }

    const currentQuestionIndex = response.data.test.questions.findIndex(
      ({ id }) => id === response.data.currentQuestionId,
    );

    router.push(
      `/test/${params.uuid}/progress?q=${Math.max(currentQuestionIndex + 1, 1)}`,
    );
  };

  return (
    <>
      <main className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-main-900 px-4 py-10">
        <form className="w-full max-w-xl rounded-lg border border-main-600/80 bg-main-800/80 p-5 shadow-2xl shadow-black/40 sm:w-auto sm:min-w-107.5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex justify-between w-full">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-main-700/80 text-main-100 ring-1 ring-main-600/80">
                  <Icon icon={test.icon} width={30} height={30} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-main-400">
                    Тестирование
                  </p>
                  <h1 className="mt-2 text-2xl font-extrabold leading-tight text-main-50 sm:text-3xl">
                    {test.title}
                  </h1>
                </div>
              </div>
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  className="p-1 text-lg font-semibold hover:bg-main-700/70"
                  onClick={openSettings}
                >
                  <Icon icon="mdi:settings" width={22} height={22} />
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-main-300 sm:text-base">
            {test.description}
          </p>

          <div className="mt-6 flex gap-3">
            <TestMetric
              icon="mdi:help-circle-outline"
              label={`${questionsCount} вопросов`}
            />
            <TestMetric
              icon="mdi:clock-outline"
              label={`${test.estimatedPassTime} мин`}
            />
            <TestMetric icon="mdi:star-outline" label={`${test.rating}`} />
          </div>

          <div className="mt-6">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                className="py-1.5 px-2 text-lg font-semibold"
              >
                Сгенерировать экспресс-тест
              </Button>
              <Button
                type="button"
                variant="primary"
                className="py-1.5 px-2 text-lg font-semibold"
                disabled={starting}
                onClick={startTest}
              >
                {starting ? "Запуск..." : "Начать тест"}
              </Button>
            </div>
          </div>
        </form>
      </main>

      <SlidedPanel
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        className="max-w-[min(480px,85vw)] w-full"
      >
        <SlidedPanel.Header>Параметры теста</SlidedPanel.Header>
        <SlidedPanel.Content>
          <div className="flex flex-col gap-4 p-1">
            <section className="rounded-lg border border-main-700 bg-main-900/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-main-50">
                    Ограничение времени
                  </p>
                  <p className="mt-1 text-sm leading-6 text-main-400">
                    Включите лимит и выберите длительность прохождения.
                  </p>
                </div>
                <InputCheckSlided
                  className="shrink-0"
                  checked={timeLimit.enabled}
                  onChange={(enabled) =>
                    updateTimeLimit({ ...timeLimit, enabled })
                  }
                />
              </div>

              {timeLimit.enabled && (
                <div className="mt-5 rounded-md bg-main-800/55 p-4">
                  <InputSlider
                    value={timeLimit.minutes}
                    onChange={(minutes) =>
                      updateTimeLimit({ ...timeLimit, minutes })
                    }
                    min={5}
                    max={180}
                    step={5}
                    showValue
                    valueFormatter={(next) => `${next} мин`}
                  />
                </div>
              )}
            </section>

            <section className="rounded-lg border border-main-700 bg-main-900/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-main-50">Подсказки</p>
                  <p className="mt-1 text-sm leading-6 text-main-400">
                    Показывать подсказки во время прохождения теста.
                  </p>
                </div>
                <InputCheckSlided
                  className="shrink-0"
                  checked={showTips}
                  onChange={updateShowTips}
                />
              </div>
            </section>

            <section className="rounded-lg border border-main-700 bg-main-900/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-main-50">Автопроверка</p>
                  <p className="mt-1 text-sm leading-6 text-main-400">
                    Проверять вопрос автоматически после выбора ответа.
                  </p>
                </div>
                <InputCheckSlided
                  className="shrink-0"
                  checked={autoCheck}
                  onChange={updateAutoCheck}
                />
              </div>
            </section>

            <section className="rounded-lg border border-main-700 bg-main-900/35 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-main-50">
                    Полная статистика
                  </p>
                  <p className="mt-1 text-sm leading-6 text-main-400">
                    Показывать все вопросы, статусы ответов и правильные ответы
                    после завершения.
                  </p>
                </div>
                <InputCheckSlided
                  className="shrink-0"
                  checked={showStats}
                  onChange={updateShowStats}
                />
              </div>
            </section>
          </div>
        </SlidedPanel.Content>
      </SlidedPanel>
    </>
  );
}
