import React from 'react';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answered: boolean[];
  onNavigate: (index: number) => void;
}

export const QuestionNavigator = ({
  totalQuestions,
  currentIndex,
  answered,
  onNavigate,
}: QuestionNavigatorProps) => {
  const total = Math.max(1, totalQuestions);

  return (
    <div className="bg-white rounded-lg shadow-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-gray-800">Вопросы</div>
        <div className="text-sm text-gray-600">{currentIndex + 1}/{total}</div>
      </div>

      <div className="max-h-40 md:max-h-[calc(100vh-220px)] overflow-auto pr-1">
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-6 gap-2">
          {Array.from({ length: total }).map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = Boolean(answered[idx]);

            const base =
              'h-9 w-full rounded-lg text-sm font-semibold transition-all border flex items-center justify-center select-none';

            const cls = isCurrent
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow'
              : isAnswered
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onNavigate(idx)}
                className={`${base} ${cls}`}
                aria-label={`Перейти к вопросу ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-600">
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-indigo-50 border border-indigo-200" />
          <span>Отвечен</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded bg-gradient-to-r from-indigo-500 to-indigo-600" />
          <span>Текущий</span>
        </div>
      </div>
    </div>
  );
};
