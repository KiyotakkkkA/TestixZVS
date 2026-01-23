import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useTest } from "../../../hooks/useTest";
import { TESTS } from "../../../tests";
import { QuestionNavigator } from "../../molecules/test";
import { Question } from "../../organisms/test";

export const TestPage = () => {

    const [checkGlow, setCheckGlow] = useState<'none' | 'correct' | 'wrong'>('none');

    const testId = useParams<{ testId: string }>().testId;
    const test = TESTS.find(t => t.uuid === testId);

    const navigate = useNavigate();

    const {
        resetTest,
        goToQuestion,
        saveAnswer,
        nextQuestion,
        prevQuestion,
        finishTest,
        evaluateAnswer,
        timeLeftSeconds,
        answerEvaluations,
        session,
        settings,
        currentQuestion,
        questions,
        result,
    } = useTest(testId || '', test?.questions || []);

    useEffect(() => {
        if (!result) return;
        if (!testId) return;
        navigate(`/tests/${testId}/results`, { replace: true });
    }, [navigate, result, testId]);

    if (!session || !currentQuestion) {
        return <div>Тест не был начат</div>;
    }

    const answeredFlags = questions.map((q) => {
        const a = session.userAnswers[q.id];
        return Boolean(a && a.length > 0);
    });

    return (
        <div className="w-full max-w-6xl m-auto">
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => {
                        setCheckGlow('none');
                        resetTest();
                        navigate(`/tests/${testId}/start`, { replace: true });
                    }}
                    className="px-4 py-2 text-gray-600 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                    Выход
                </button>
            </div>

            <div className="md:flex md:items-start md:gap-6">
                <div className="mb-6 md:mb-0 md:w-72 md:flex-none">
                    <QuestionNavigator
                        totalQuestions={questions.length}
                        currentIndex={session.currentQuestionIndex}
                        answered={answeredFlags}
                        onNavigate={(index) => {
                            setCheckGlow('none');
                            goToQuestion(index);
                        }}
                    />
                </div>

                <div className="flex-1">
                <div
                    className={
                    `bg-white rounded-lg shadow-xl p-6 md:p-8 transition-shadow ` +
                    (checkGlow === 'correct'
                        ? 'shadow-emerald-200/60 ring-2 ring-emerald-300'
                        : checkGlow === 'wrong'
                        ? 'shadow-rose-200/60 ring-2 ring-rose-300'
                        : '')
                    }
                >
                    <Question
                        question={currentQuestion}
                        currentQuestionIndex={session.currentQuestionIndex}
                        totalQuestions={questions.length}
                        userAnswer={session.userAnswers[currentQuestion.id]}
                        onAnswerChange={(answer) => saveAnswer(currentQuestion.id, answer)}
                        evaluation={answerEvaluations[currentQuestion.id] ?? null}
                        onEvaluateAnswer={evaluateAnswer}
                        onNext={nextQuestion}
                        onPrev={prevQuestion}
                        onFinish={() => {
                            finishTest();
                            navigate(`/tests/${testId}/results`);
                        }}
                        onCheckGlowChange={setCheckGlow}
                        timeLeftSeconds={timeLeftSeconds}
                        settings={settings}
                    />
                </div>
                </div>
            </div>
        </div>
    )
}