import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useTestPassing } from "../../../hooks/tests/passing";
import { TestService } from "../../../services/test";
import { StorageService } from "../../../services/storage";
import { QuestionNavigator } from "../../molecules/tests";
import { Question } from "../../organisms/tests";
import { Spinner } from "../../atoms";

import type { Test } from "../../../types/tests/Test";

export const TestPage = () => {
    const [checkGlow, setCheckGlow] = useState<"none" | "correct" | "wrong">(
        "none",
    );

    const testId = useParams<{ testId: string }>().testId;
    const location = useLocation();
    const [dbTest, setDbTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);

    const navigate = useNavigate();

    const savedSource = StorageService.getSession()?.source;
    const source =
        (location.state as { source?: "local" | "db" } | null)?.source ??
        savedSource ??
        "db";

    const accessLink = new URLSearchParams(location.search).get("access_link");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!testId) return;
            if (source === "local") return;
            try {
                setIsLoading(true);
                setAccessError(null);
                const response = await TestService.getPublicTestById(
                    testId,
                    accessLink,
                );
                if (!mounted) return;
                setDbTest({
                    uuid: response.test.id,
                    discipline_name: response.test.title,
                    total_questions: response.test.total_questions,
                    total_disabled: response.test.total_disabled,
                    questions: response.test.questions,
                });
            } catch (e) {
                if (!mounted) return;
                setAccessError("Не удалось загрузить тест");
                setDbTest(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [testId, source, accessLink]);

    const test = dbTest;

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
    } = useTestPassing(testId || "", test?.questions || []);

    useEffect(() => {
        if (!result) return;
        if (!testId) return;
        navigate(`/tests/${testId}/results`, { replace: true });
    }, [navigate, result, testId]);

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl m-auto">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Загружаем тест...
                    </div>
                </div>
            </div>
        );
    }

    if (accessError) {
        return (
            <div className="w-full max-w-6xl m-auto">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                    {accessError}
                </div>
            </div>
        );
    }

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
                        setCheckGlow("none");
                        resetTest();
                        navigate(`/tests/${testId}/start`, { replace: true });
                    }}
                    className="px-4 py-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
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
                            setCheckGlow("none");
                            goToQuestion(index);
                        }}
                    />
                </div>

                <div className="flex-1">
                    <div
                        className={
                            `bg-slate-50 rounded-lg shadow-xl p-6 md:p-8 transition-shadow ` +
                            (checkGlow === "correct"
                                ? "shadow-emerald-200/60 ring-2 ring-emerald-300"
                                : checkGlow === "wrong"
                                  ? "shadow-rose-200/60 ring-2 ring-rose-300"
                                  : "")
                        }
                    >
                        <Question
                            question={currentQuestion}
                            currentQuestionIndex={session.currentQuestionIndex}
                            totalQuestions={questions.length}
                            userAnswer={session.userAnswers[currentQuestion.id]}
                            onAnswerChange={(answer) =>
                                saveAnswer(currentQuestion.id, answer)
                            }
                            evaluation={
                                answerEvaluations[currentQuestion.id] ?? null
                            }
                            onEvaluateAnswer={evaluateAnswer}
                            onNext={nextQuestion}
                            onPrev={prevQuestion}
                            onFinish={async () => {
                                await finishTest();
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
    );
};
