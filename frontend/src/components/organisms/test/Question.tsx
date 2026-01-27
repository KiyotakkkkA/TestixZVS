import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

import { resolveQuestionComponent, type AnswerEvaluation } from '../../../utils/QuestionTypeRegistry';

import type { TestQuestion, TestSettings } from '../../../types/Test';
import { Button } from '../../atoms';

interface QuestionProps {
  question: TestQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  userAnswer: number[] | string[] | undefined;
  onAnswerChange: (answer: number[] | string[]) => void;
  evaluation?: { scorePercent: number; comment: string; userAnswerText: string } | null;
  onEvaluateAnswer?: (question: TestQuestion, userAnswer: number[] | string[]) => Promise<AnswerEvaluation>;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void | Promise<void>;
  settings: TestSettings | null;
  onCheckGlowChange?: (state: 'none' | 'correct' | 'wrong') => void;
  timeLeftSeconds?: number | null;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  evaluation,
  onEvaluateAnswer,
  onNext,
  onPrev,
  onFinish,
  settings,
  onCheckGlowChange,
  timeLeftSeconds,
}) => {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isAnswered = userAnswer && userAnswer.length > 0;
  const isFullAnswer = question.type === 'full_answer';

  const [hintActive, setHintActive] = useState(false);
  const [checkedState, setCheckedState] = useState<'none' | 'correct' | 'wrong'>('none');
  const isChecked = checkedState !== 'none';

  const revealCorrect = useMemo(() => {
    if (isFullAnswer) return false;
    return Boolean(hintActive) || Boolean(isChecked);
  }, [hintActive, isChecked, isFullAnswer]);

  useEffect(() => {
    setHintActive(false);
    setCheckedState('none');
    onCheckGlowChange?.('none');
  }, [question.id, onCheckGlowChange]);

  const showHintButton = !isFullAnswer && Boolean(settings?.hintsEnabled) && !isChecked;
  const isCheckAfterAnswer = isFullAnswer ? true : Boolean(settings?.checkAfterAnswer);

  const [checking, setChecking] = useState(false);

  const activeEvaluation = useMemo(() => {
    if (!isFullAnswer || !evaluation) return null;
    const currentText = String((userAnswer as string[] | undefined)?.[0] ?? '');
    return evaluation.userAnswerText === currentText
      ? { scorePercent: evaluation.scorePercent, comment: evaluation.comment }
      : null;
  }, [evaluation, isFullAnswer, userAnswer]);

  const timePill = useMemo(() => {
    if (typeof timeLeftSeconds !== 'number') return null;
    const t = Math.max(0, Math.floor(timeLeftSeconds));
    const m = Math.floor(t / 60);
    const s = t % 60;
    const urgent = t <= 60;
    return (
      <span
        className={
          `inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-xs font-semibold ` +
          (urgent
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-indigo-200 bg-indigo-50 text-indigo-800')
        }
      >
        Осталось {m}:{s.toString().padStart(2, '0')}
      </span>
    );
  }, [timeLeftSeconds]);

  const runCheckIfNeeded = async (): Promise<boolean> => {
    if (!isAnswered) return false;
    if (!isCheckAfterAnswer) return true;
    if (isChecked) return true;

    if (!onEvaluateAnswer) return false;

    try {
      setChecking(true);
      const ev = await onEvaluateAnswer(question, userAnswer ?? []);
      const nextState: 'correct' | 'wrong' = ev.correct ? 'correct' : 'wrong';
      setCheckedState(nextState);
      setHintActive(false);
      onCheckGlowChange?.(nextState);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const handleNext = async () => {
    if (!isAnswered) return;

    if (isCheckAfterAnswer && !isChecked) {
      await runCheckIfNeeded();
      return;
    }

    setCheckedState('none');
    onCheckGlowChange?.('none');
    onNext();
  };

  const handleFinish = async () => {
    if (!isAnswered) return;

    if (isCheckAfterAnswer && !isChecked) {
      await runCheckIfNeeded();
      return;
    }

    await onFinish();
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Вопрос {currentQuestionIndex + 1} из {totalQuestions}</span>
          <span className="inline-flex items-center gap-3">
            {timePill}
            <span>{Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.question}</h2>

        {question.files && question.files.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {question.files.map((file) => (
              <div key={file.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {file.mime_type?.startsWith('image/') ? (
                  <img src={file.url} alt={file.name} className="h-full w-full object-contain bg-slate-50" />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center text-slate-400">
                    <Icon icon="mdi:file-outline" className="h-8 w-8" />
                  </div>
                )}
                <div className="px-3 py-2 text-xs text-slate-600 truncate">{file.name}</div>
              </div>
            ))}
          </div>
        )}

        {isChecked ? (
          <div
            className={
              `mb-6 rounded-lg border px-4 py-3 font-semibold ` +
              (checkedState === 'correct'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800')
            }
          >
            {checkedState === 'correct' ? 'Правильно' : 'Неправильно'}
          </div>
        ) : null}

        {(() => {
          const QuestionComponent = resolveQuestionComponent(question);
          if (!QuestionComponent) return null;
          return (
            <QuestionComponent
              question={question}
              userAnswer={userAnswer}
              onAnswerChange={onAnswerChange}
              revealCorrect={revealCorrect}
              evaluation={activeEvaluation}
              fullAnswerCheckMode={settings?.fullAnswerCheckMode}
              checkedState={checkedState}
              disabled={isChecked}
            />
          );
        })()}
      </div>

      <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 md:flex-row">
        <Button
          secondary
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
          className="w-full px-4 py-3 text-lg font-medium md:flex-1"
        >
          Назад
        </Button>

        {showHintButton ? (
          <button
            type="button"
            onClick={() => setHintActive((v) => !v)}
            disabled={!isAnswered}
            className={
              `w-full px-4 py-3 rounded-lg font-semibold transition-all border md:flex-1 md:order-2 order-3 ` +
              (hintActive
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50') +
              (!isAnswered ? ' opacity-50 cursor-not-allowed' : '')
            }
            aria-label="Подсказка"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Icon icon="mdi:lightbulb-on-outline" className="h-5 w-5" />
              Подсказка
            </span>
          </button>
        ) : null}

        {isLastQuestion ? (
          <Button
            success
            onClick={() => void handleFinish()}
            disabled={!isAnswered || checking}
            className="w-full px-4 py-3 text-lg font-medium md:flex-1 md:order-3 order-2"
          >
            {checking ? 'Проверяем…' : isCheckAfterAnswer && !isChecked ? 'Проверить' : 'Завершить тест'}
          </Button>
        ) : (
          <Button
            primary
            onClick={() => void handleNext()}
            disabled={!isAnswered || checking}
            className="w-full px-4 py-3 text-lg font-medium md:flex-1 md:order-3 order-2"
          >
            {checking
              ? 'Проверяем…'
              : isCheckAfterAnswer
              ? isChecked
                ? 'Продолжить'
                : 'Проверить'
              : 'Далее'}
          </Button>
        )}
      </div>
    </div>
  );
};
