import {useMemo} from 'react';

import type { MatchingQuestion } from '../../../../types/Test';

interface MatchingProps {
  question: MatchingQuestion;
  userAnswer: string[] | undefined;
  onAnswerChange: (answer: string[]) => void;
  revealCorrect?: boolean;
  checkedState?: 'none' | 'correct' | 'wrong';
  disabled?: boolean;
}

export const Matching = ({
  question,
  userAnswer = [],
  onAnswerChange,
  revealCorrect = false,
  checkedState = 'none',
  disabled = false,
}: MatchingProps) => {
  const usedMeaningByTerm = useMemo(() => {
    const map = new Map<string, number>();
    userAnswer.forEach((pair) => {
      const termKey = pair.substring(0, 1);
      const meaningIndex = Number(pair.substring(1));
      if (!Number.isNaN(meaningIndex) && termKey) {
        map.set(termKey, meaningIndex);
      }
    });
    return map;
  }, [userAnswer]);

  const getSelectedTermForMeaning = (meaningIndex: number): string => {
    const match = userAnswer.find((pair) => Number(pair.substring(1)) === meaningIndex);
    return match ? match.substring(0, 1) : '';
  };

  const handleMatchChange = (meaningIndex: number, nextTerm: string) => {
    if (disabled) return;

    const next = userAnswer
      .filter((pair) => Number(pair.substring(1)) !== meaningIndex)
      .filter((pair) => (nextTerm ? pair.substring(0, 1) !== nextTerm : true));

    if (nextTerm) {
      next.push(`${nextTerm}${meaningIndex}`);
    }

    next.sort((a, b) => {
      const ai = Number(a.substring(1));
      const bi = Number(b.substring(1));
      return ai - bi;
    });

    onAnswerChange(next);
  };

  const correctByMeaningIndex: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    question.correctAnswers.forEach((pair) => {
      const termKey = pair.substring(0, 1);
      const meaningIndex = Number(pair.substring(1));
      map[meaningIndex] = termKey;
    });
    return map;
  }, [question.correctAnswers]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-6">Установите соответствие между терминами и определениями</p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Термины</h4>
          <div className="space-y-2">
            {Object.entries(question.terms).map(([key, term]) => (
              <div key={key} className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-900">{key}</p>
                <p className="text-sm text-blue-700">{term}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700">Определения</h4>
          <div className="space-y-3">
            {Object.entries(question.meanings).map(([index, meaning]) => {
              const idx = parseInt(index);
              const selectedTerm = getSelectedTermForMeaning(idx);
              const correctTerm = correctByMeaningIndex[idx];
              const isRowCorrect = selectedTerm && correctTerm ? selectedTerm === correctTerm : false;
              const showWrong = checkedState === 'wrong' && Boolean(selectedTerm) && !isRowCorrect;

              return (
                <div
                  key={index}
                  className={
                    `p-3 rounded border ` +
                    (checkedState !== 'none'
                      ? isRowCorrect
                        ? 'bg-emerald-50 border-emerald-200'
                        : showWrong
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-green-50 border-green-200'
                      : 'bg-green-50 border-green-200')
                  }
                >
                  <p className="text-sm text-green-700 mb-2">{meaning}</p>
                  <select
                    value={selectedTerm}
                    onChange={(e) => handleMatchChange(idx, e.target.value)}
                    disabled={disabled}
                    className={
                      `w-full px-3 py-2 rounded bg-white text-sm focus:outline-none ` +
                      (checkedState === 'wrong'
                        ? showWrong
                          ? 'border border-rose-300 focus:border-rose-400'
                          : isRowCorrect
                          ? 'border border-emerald-300 focus:border-emerald-400'
                          : 'border border-green-300 focus:border-indigo-500'
                        : 'border border-green-300 focus:border-indigo-500') +
                      (disabled ? ' opacity-80 cursor-not-allowed' : '')
                    }
                  >
                    <option value="">Выберите термин...</option>
                    {Object.keys(question.terms).map((term) => (
                      <option
                        key={term}
                        value={term}
                        disabled={usedMeaningByTerm.has(term) && usedMeaningByTerm.get(term) !== idx}
                      >
                        {term}
                      </option>
                    ))}
                  </select>

                  {revealCorrect && correctTerm ? (
                    <div className="mt-2 text-sm text-gray-700">
                      Правильно: <span className="font-semibold text-emerald-700">{correctTerm}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {revealCorrect ? (
        <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="font-semibold text-emerald-900">Правильное соответствие</div>
          <div className="mt-2 space-y-1 text-sm text-emerald-900">
            {question.correctAnswers.map((pair) => {
              const termKey = pair.substring(0, 1);
              const meaningIndex = Number(pair.substring(1));
              const termText = question.terms[termKey];
              const meaningText = question.meanings[meaningIndex];
              return (
                <div key={pair}>
                  <span className="font-semibold">{termKey}</span>: {termText} — {meaningText}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
