import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, InputSlider, Modal } from '../../atoms';
import { useTestPassing } from '../../../hooks/tests/useTestPassing';
import { Test, type FullAnswerCheckMode } from '../../../types/Test';

export interface ExpressTestConfig {
  timeLimitEnabled: boolean;
  timeLimitMinutes: number;
  questionCount: number;
  passThreshold: number;
  fullAnswerCheckMode: FullAnswerCheckMode;
}

interface ExpressTestModalProps {
  test: Test;
  open: boolean;
  totalQuestions: number;
  onClose: () => void;
  source?: 'local' | 'db';
}

const clampInt = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
};

export const ExpressTestModal = ({
  test,
  open,
  totalQuestions,
  onClose,
  source = 'local',
}: ExpressTestModalProps) => {
  const total = Math.max(1, totalQuestions);

  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [questionCount, setQuestionCount] = useState(Math.min(20, total));
  const [passThreshold, setPassThreshold] = useState(
    Math.min(Math.min(20, total), Math.ceil(Math.min(20, total) * 0.85))
  );
  const [fullAnswerCheckMode, setFullAnswerCheckMode] = useState<FullAnswerCheckMode>('medium');

  const { startTest } = useTestPassing(test.uuid, test.questions);

  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const qc = Math.min(20, total);
    setQuestionCount(qc);
    setPassThreshold(Math.min(qc, Math.ceil(qc * 0.85)));
    setTimeLimitEnabled(false);
    setTimeLimitMinutes(20);
    setFullAnswerCheckMode('medium');
  }, [open, total]);

  useEffect(() => {
    setPassThreshold((prev) => clampInt(prev, 1, Math.max(1, questionCount)));
  }, [questionCount]);

  const canStart = useMemo(() => {
    if (questionCount < 1 || questionCount > total) return false;
    if (passThreshold < 1 || passThreshold > questionCount) return false;
    if (timeLimitEnabled && (timeLimitMinutes < 1 || timeLimitMinutes > 999)) return false;
    return true;
  }, [passThreshold, questionCount, timeLimitEnabled, timeLimitMinutes, total]);

  const calculateQuestionIds = (): {questionIds: number[], passThreshold: number} => {
    const total = test.questions.length;
    const count = Math.min(Math.max(1, questionCount), Math.max(1, total));
    const passThresholdClamped = Math.min(Math.max(1, passThreshold), count);

    const ids = test.questions.map((q) => q.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return { questionIds: ids.slice(0, count), passThreshold: passThresholdClamped };
  }

  const fullAnswerModes: { value: FullAnswerCheckMode; title: string; description: string }[] = [
    { value: 'lite', title: 'Lite', description: 'Достаточно передать суть ответа' },
    { value: 'medium', title: 'Medium', description: 'Нужны ключевые термины и конструкции' },
    { value: 'hard', title: 'Hard', description: 'Почти полное воспроизведение ответа' },
    { value: 'unreal', title: 'Unreal', description: 'Практически дословное совпадение' },
  ];

  return (
    <Modal open={open} onClose={onClose} title={
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
        Экспресс-тест
      </h2>
    }>
      <p className="text-sm text-gray-600 mt-1 px-1 text-justify">
        Случайные вопросы из выбранного теста. Подсказки и автопроверка отключены, а неправильные ответы всегда показываются.
      </p>

      <div className="px-2 py-5 space-y-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="font-semibold text-gray-800">Ограничение по времени</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTimeLimitEnabled(false)}
              className={
                `rounded-lg border px-4 py-3 text-left transition-colors items-start ` +
                (!timeLimitEnabled
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50')
              }
            >
              <div className="font-semibold text-gray-900">Нет</div>
              <div className="text-sm text-gray-600 mt-1">Без таймера</div>
            </button>

            <button
              type="button"
              onClick={() => setTimeLimitEnabled(true)}
              className={
                `rounded-lg border px-4 py-3 text-left transition-colors ` +
                (timeLimitEnabled
                  ? 'border-indigo-200 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50')
              }
            >
              <div className="font-semibold text-gray-900">Да</div>
              <div className="text-sm text-gray-600 mt-1">Завершится автоматически</div>
            </button>
          </div>

          {timeLimitEnabled ? (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-800">
                Сколько минут?
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(clampInt(Number(e.target.value), 1, 999))}
                  className="w-32 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span className="text-sm text-gray-600">мин.</span>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-800">Количество вопросов</div>
              <div className="text-sm text-gray-600 mt-1">Случайные вопросы из теста</div>
            </div>
            <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1">
              {questionCount} / {total}
            </div>
          </div>

          <InputSlider
            min={1}
            max={total}
            step={1}
            value={questionCount}
            onChange={(value) => setQuestionCount(clampInt(value, 1, total))}
          />
        </div>

        <div className="border-t border-gray-200" />

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-800">Порог прохода</div>
              <div className="text-sm text-gray-600 mt-1">Минимум правильных ответов</div>
            </div>
            <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1">
              {passThreshold} / {questionCount}
            </div>
          </div>

          <InputSlider
            min={1}
            max={Math.max(1, questionCount)}
            step={1}
            value={clampInt(passThreshold, 1, Math.max(1, questionCount))}
            onChange={(value) => setPassThreshold(clampInt(value, 1, Math.max(1, questionCount)))}
          />
        </div>

        <div className="border-t border-gray-200" />

        <div>
          <div className="font-semibold text-gray-800">Режим проверки для полного ответа</div>
          <div className="text-sm text-gray-600 mt-1">Определяет строгость оценки AI</div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {fullAnswerModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setFullAnswerCheckMode(mode.value)}
                className={
                  `rounded-lg border px-4 py-3 text-left transition-colors ` +
                  (fullAnswerCheckMode === mode.value
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50')
                }
              >
                <div className="font-semibold text-gray-900">{mode.title}</div>
                <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 pb-2 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3 justify-end text-xl font-medium tracking-tight">
        <Button
        primary
          disabled={!canStart}
          className='flex-1 px-4 py-3'
          onClick={() => {
            const { questionIds, passThreshold: pt } = calculateQuestionIds();

            const timeLimitSeconds = timeLimitEnabled
              ? Math.max(60, Math.round(timeLimitMinutes * 60))
              : undefined;

            startTest({
              mode: 'express',
              source,
              questionIds,
              timeLimitSeconds,
              settings: {
                passThreshold: pt,
                hintsEnabled: false,
                checkAfterAnswer: false,
                showIncorrectAtEnd: true,
                fullAnswerCheckMode,
              }
            })
            navigate(`/tests/${test.uuid}`);
          }}
        >
          Сгенерировать и начать
        </Button>
      </div>
    </Modal>
  );
};