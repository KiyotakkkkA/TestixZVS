import { useParams, useNavigate } from 'react-router-dom';

import { useTestPassing } from '../../../hooks/tests/useTestPassing';

export const TestResultsPage = () => {

  const testId = useParams<{ testId: string }>().testId;

  const { result, resetTest } = useTestPassing(testId || '', []);

  const navigate = useNavigate();

  if (!result) {
    return <div>Результаты недоступны</div>;
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return 'Отлично! Вы отлично знаете материал!';
    if (percentage >= 80) return 'Хорошо! Вы хорошо усвоили материал!';
    if (percentage >= 70) return 'Удовлетворительно! Подтяните слабые места!';
    if (percentage >= 60) return 'Неплохо! Повторите материал еще раз!';
    return 'Нужно больше заниматься. Повторите материал!';
  };

  const minutes = Math.floor(result.timeSpent / 60);
  const seconds = result.timeSpent % 60;

  const passed = result.passed;
  const passThreshold = result.passThreshold;

  return (
    <div className="w-full max-w-2xl space-y-8 mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Тест завершён!</h1>
        <p className="text-gray-600 mb-8">Вот ваши результаты</p>

        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={result.percentage >= 80 ? 'url(#greenGradient)' : result.percentage >= 60 ? 'url(#yellowGradient)' : 'url(#redGradient)'}
              strokeWidth="12"
              strokeDasharray={`${(result.percentage / 100) * (2 * Math.PI * 90)} ${2 * Math.PI * 90}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(result.percentage)} bg-clip-text text-transparent`}>
              {result.percentage}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {result.correctAnswers}/{result.totalQuestions}
            </div>
          </div>
        </div>

        <p className="text-xl text-gray-700 font-semibold mb-2">
          {getScoreMessage(result.percentage)}
        </p>

        {typeof passed === 'boolean' && typeof passThreshold === 'number' ? (
          <div className="mt-4 inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <span
              className={
                `px-3 py-1 rounded-lg font-semibold ` +
                (passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
              }
            >
              {passed ? 'Пройдено' : 'Не пройдено'}
            </span>
            <span className="text-sm text-gray-700">
              Порог: <span className="font-semibold">{passThreshold}</span> из {result.totalQuestions}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">{result.correctAnswers}</div>
            <div className="text-sm text-gray-600 mt-1">Правильных</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</div>
            <div className="text-sm text-gray-600 mt-1">Неправильных</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600 mt-1">Время</div>
          </div>
        </div>

        {result.incorrectReview && result.incorrectReview.length > 0 ? (
          <div className="mt-8 pt-8 border-t border-gray-200 text-left">
            <h2 className="text-xl font-bold text-gray-800">Неправильные ответы</h2>
            <p className="text-sm text-gray-600 mt-1">
              Вопросы, в которых была ошибка, и правильные ответы
            </p>

            <div className="mt-4 space-y-4">
              {result.incorrectReview.map((item) => (
                <div key={item.questionNumber} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="text-sm font-semibold text-gray-500">Вопрос {item.questionNumber}</div>
                  <div className="mt-1 font-semibold text-gray-800">{item.questionText}</div>
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="font-semibold text-emerald-800">Правильные ответы:</div>
                    <ul className="mt-1 list-disc pl-5">
                      {item.correctAnswersText.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result.fullAnswerReview && result.fullAnswerReview.length > 0 ? (
          <div className="mt-8 pt-8 border-t border-gray-200 text-left">
            <h2 className="text-xl font-bold text-gray-800">Оценка ответов (полный ответ)</h2>
            <p className="text-sm text-gray-600 mt-1">
              Комментарии модели по вашим ответам. Эти пункты показываются всегда.
            </p>

            <div className="mt-4 space-y-4">
              {result.fullAnswerReview.map((item) => (
                <div key={item.questionNumber} className="rounded-lg border border-indigo-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-500">Вопрос {item.questionNumber}</div>
                      <div className="mt-1 font-semibold text-gray-800">{item.questionText}</div>
                    </div>
                    <div className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">
                      {Math.round(item.scorePercent)}%
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div className="font-semibold text-gray-800">Ваш ответ:</div>
                    <div className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      {item.userAnswerText || '—'}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    <div className="font-semibold text-indigo-800">Комментарий модели:</div>
                    <div className="mt-1 whitespace-pre-wrap">{item.comment || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <button
        onClick={() => {
          resetTest();
          navigate(`/tests/${testId}/start`);
        }}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
      >
        Пройти тест снова
      </button>
    </div>
  );
};
