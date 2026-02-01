import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    IncorrectReviewItem,
    TestSession,
    TestResult,
    TestSettings,
    TestQuestion,
    FullAnswerReviewItem,
} from "../../../types/tests/Test";
import { StorageService } from "../../../services/storage";
import { TestService } from "../../../services/test";

import {
    evaluateAnswer,
    type AnswerEvaluation,
} from "../../../utils/QuestionTypeRegistry";
import { useTestCompletionCreate } from "./useTestCompletionCreate";

export const useTestPassing = (
    testId: string | null,
    questions: TestQuestion[],
) => {
    const [session, setSession] = useState<TestSession | null>(null);
    const [result, setResult] = useState<TestResult | null>(null);
    const [settingsDraft, setSettingsDraft] = useState<TestSettings | null>(
        null,
    );
    const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
    const timedOutRef = useRef(false);

    const { saveCompletion } = useTestCompletionCreate();

    const setAnswerEvaluation = useCallback(
        (
            questionId: number,
            evaluation: {
                scorePercent: number;
                comment: string;
                userAnswerText: string;
            },
        ) => {
            if (!session) return;

            const updatedSession: TestSession = {
                ...session,
                answerEvaluations: {
                    ...(session.answerEvaluations ?? {}),
                    [questionId]: evaluation,
                },
            };

            setSession(updatedSession);
            StorageService.saveSession(updatedSession);
        },
        [session],
    );

    const getDefaultSettings = useCallback((): TestSettings => {
        const total = Math.max(1, questions.length);
        return {
            passThreshold: Math.min(
                total,
                Math.max(1, Math.ceil(total * 0.85)),
            ),
            hintsEnabled: false,
            checkAfterAnswer: false,
            showIncorrectAtEnd: false,
            fullAnswerCheckMode: "medium",
        };
    }, [questions.length]);

    const evaluateAndStore = useCallback(
        async (
            question: TestQuestion,
            userAnswer: number[] | string[],
        ): Promise<AnswerEvaluation> => {
            const activeSettings =
                session?.settings ?? settingsDraft ?? getDefaultSettings();
            const ev = await evaluateAnswer(
                question,
                userAnswer,
                activeSettings,
            );

            if (question.type === "full_answer") {
                const ua = Array.isArray(userAnswer)
                    ? (userAnswer as string[])
                    : [];
                const userAnswerText = String(ua[0] ?? "");
                setAnswerEvaluation(question.id, {
                    scorePercent: ev.scorePercent ?? (ev.correct ? 100 : 0),
                    comment: ev.comment ?? "",
                    userAnswerText,
                });
            }

            return ev;
        },
        [
            session?.settings,
            settingsDraft,
            getDefaultSettings,
            setAnswerEvaluation,
        ],
    );

    useEffect(() => {
        const savedSession = StorageService.getSession();

        if (!savedSession) {
            setSession(null);
            return;
        }

        if (testId && savedSession.testId !== testId) {
            setSession(null);
            return;
        }

        setSession(savedSession);
    }, [testId]);

    useEffect(() => {
        if (!testId) {
            setResult(null);
            return;
        }
        const savedResult = StorageService.getResult(testId);
        setResult(savedResult);
    }, [testId]);

    const activeQuestions: TestQuestion[] = useMemo(() => {
        if (!session?.questionIds || session.questionIds.length === 0)
            return questions;
        const byId = new Map<number, TestQuestion>();
        questions.forEach((q) => byId.set(q.id, q));
        return session.questionIds
            .map((id) => byId.get(id))
            .filter((q): q is TestQuestion => Boolean(q));
    }, [questions, session?.questionIds]);

    useEffect(() => {
        if (!testId) {
            setSettingsDraft(null);
            return;
        }
        if (session?.testId === testId && session.settings) {
            setSettingsDraft({ ...getDefaultSettings(), ...session.settings });
            return;
        }
        setSettingsDraft(getDefaultSettings());
    }, [
        testId,
        questions.length,
        session?.testId,
        session?.settings,
        getDefaultSettings,
    ]);

    const startTest = useCallback(
        (opts?: {
            mode?: "normal" | "express";
            source?: "local" | "db";
            questionIds?: number[];
            settings?: TestSettings;
            timeLimitSeconds?: number;
        }) => {
            if (!testId) return;
            setResult(null);
            StorageService.clearResult();
            const now = Date.now();
            const settings = {
                ...getDefaultSettings(),
                ...(opts?.settings ?? settingsDraft ?? {}),
            };
            const newSession: TestSession = {
                testId,
                source: opts?.source,
                currentQuestionIndex: 0,
                userAnswers: {},
                answerEvaluations: {},
                startTime: now,
                settings,
                mode: opts?.mode ?? "normal",
                questionIds: opts?.questionIds,
                timeLimitSeconds: opts?.timeLimitSeconds,
            };
            timedOutRef.current = false;
            setTimeLeftSeconds(
                typeof newSession.timeLimitSeconds === "number"
                    ? Math.max(0, Math.ceil(newSession.timeLimitSeconds))
                    : null,
            );
            setSession(newSession);
            StorageService.saveSession(newSession);

            saveCompletion({
                test_id: testId,
                type: "started",
                right_answers: 0,
                wrong_answers: 0,
                percentage: 0,
            }).catch((e) => {
                console.error("Failed to save test start statistics:", e);
            });
        },
        [testId, getDefaultSettings, settingsDraft, saveCompletion],
    );

    const updateSettings = useCallback(
        (partial: Partial<TestSettings>) => {
            const total = Math.max(1, questions.length);
            const base = {
                ...getDefaultSettings(),
                ...(session?.settings ?? settingsDraft ?? {}),
            };
            const next: TestSettings = { ...base, ...partial };

            next.passThreshold = Math.min(
                total,
                Math.max(1, Math.round(next.passThreshold)),
            );

            if (session) {
                const updatedSession: TestSession = {
                    ...session,
                    settings: next,
                };

                setSession(updatedSession);
                StorageService.saveSession(updatedSession);
            } else {
                setSettingsDraft(next);
            }
        },
        [session, questions.length, getDefaultSettings, settingsDraft],
    );

    const saveAnswer = useCallback(
        (questionId: number, answer: number[] | string[]) => {
            if (!session) return;

            const updatedSession: TestSession = {
                ...session,
                userAnswers: {
                    ...session.userAnswers,
                    [questionId]: answer,
                },
            };

            setSession(updatedSession);
            StorageService.saveSession(updatedSession);
        },
        [session],
    );

    const nextQuestion = useCallback(() => {
        if (!session) return;

        const nextIndex = session.currentQuestionIndex + 1;
        if (nextIndex < activeQuestions.length) {
            const updatedSession: TestSession = {
                ...session,
                currentQuestionIndex: nextIndex,
            };
            setSession(updatedSession);
            StorageService.saveSession(updatedSession);
        }
    }, [session, activeQuestions.length]);

    const prevQuestion = useCallback(() => {
        if (!session || session.currentQuestionIndex === 0) return;

        const updatedSession: TestSession = {
            ...session,
            currentQuestionIndex: session.currentQuestionIndex - 1,
        };
        setSession(updatedSession);
        StorageService.saveSession(updatedSession);
    }, [session]);

    const goToQuestion = useCallback(
        (index: number) => {
            if (!session) return;
            const nextIndex = Math.min(
                Math.max(0, index),
                Math.max(0, activeQuestions.length - 1),
            );
            if (nextIndex === session.currentQuestionIndex) return;

            const updatedSession: TestSession = {
                ...session,
                currentQuestionIndex: nextIndex,
            };
            setSession(updatedSession);
            StorageService.saveSession(updatedSession);
        },
        [session, activeQuestions.length],
    );

    const finishTest = useCallback(async () => {
        if (!session) return;

        const now = Date.now();
        const timeSpent = Math.floor((now - session.startTime) / 1000);

        const fullAnswerThreshold = (() => {
            const v = Number(
                process.env.REACT_APP_FULL_ANSWER_CORRECT_FROM_PERCENT ?? 70,
            );
            return Number.isFinite(v)
                ? Math.min(100, Math.max(0, Math.round(v)))
                : 70;
        })();

        const evaluations = session.answerEvaluations ?? {};

        let correctCount = 0;
        const answers = activeQuestions.map((question) => {
            const userAnswer = session.userAnswers[question.id] || [];
            const ev = evaluations[question.id];

            const correct =
                question.type === "full_answer"
                    ? Boolean(ev) &&
                      ev.userAnswerText ===
                          String((userAnswer as string[])[0] ?? "") &&
                      ev.scorePercent >= fullAnswerThreshold
                    : TestService.isAnswerCorrect(question, userAnswer);

            if (correct) correctCount++;

            return {
                questionId: question.id,
                userAnswer,
                correct,
                scorePercent: ev?.scorePercent,
                comment: ev?.comment,
            };
        });

        const settings = {
            ...getDefaultSettings(),
            ...(session.settings ?? {}),
        };
        const passThreshold = Math.min(
            activeQuestions.length,
            Math.max(1, Math.round(settings.passThreshold)),
        );

        const incorrectReview: IncorrectReviewItem[] | undefined =
            settings.showIncorrectAtEnd
                ? activeQuestions
                      .map((question, index) => {
                          const userAnswer =
                              session.userAnswers[question.id] || [];
                          const correct = TestService.isAnswerCorrect(
                              question,
                              userAnswer,
                          );
                          if (correct) return null;

                          if (
                              question.type === "single" ||
                              question.type === "multiple"
                          ) {
                              const correctAnswersText = question.correctAnswers
                                  .slice()
                                  .sort((a, b) => a - b)
                                  .map((i) => question.options[i])
                                  .filter(Boolean);
                              return {
                                  questionNumber: index + 1,
                                  questionText: question.question,
                                  correctAnswersText,
                              };
                          }

                          if (question.type === "matching") {
                              const correctAnswersText =
                                  question.correctAnswers.map((pair) => {
                                      const termKey = pair.substring(0, 1);
                                      const meaningIndex = Number(
                                          pair.substring(1),
                                      );
                                      const termText = question.terms[termKey];
                                      const meaningText =
                                          question.meanings[meaningIndex];
                                      return `${termKey}: ${termText} — ${meaningText}`;
                                  });
                              return {
                                  questionNumber: index + 1,
                                  questionText: question.question,
                                  correctAnswersText,
                              };
                          }

                          if (question.type === "full_answer") return null;

                          return null;
                      })
                      .filter((x): x is IncorrectReviewItem => Boolean(x))
                : undefined;

        const fullAnswerReview: FullAnswerReviewItem[] = activeQuestions
            .map((question, index) => {
                if (question.type !== "full_answer") return null;
                const ua = session.userAnswers[question.id] || [];
                const userAnswerText = String((ua as string[])[0] ?? "");
                const ev = evaluations[question.id];
                return {
                    questionNumber: index + 1,
                    questionText: question.question,
                    userAnswerText,
                    scorePercent:
                        ev?.userAnswerText === userAnswerText
                            ? (ev?.scorePercent ?? 0)
                            : 0,
                    comment:
                        ev?.userAnswerText === userAnswerText
                            ? (ev?.comment ?? "Оценка модели не получена.")
                            : "Ответ изменён после оценки — оценка устарела.",
                };
            })
            .filter((x): x is FullAnswerReviewItem => Boolean(x));

        const finalResult: TestResult = {
            totalQuestions: activeQuestions.length,
            correctAnswers: correctCount,
            percentage: Math.round(
                (correctCount / Math.max(1, activeQuestions.length)) * 100,
            ),
            timeSpent,
            passThreshold,
            passed: correctCount >= passThreshold,
            settings,
            incorrectReview,
            fullAnswerReview:
                fullAnswerReview.length > 0 ? fullAnswerReview : undefined,
            answers,
        };

        if (finalResult) {
            try {
                await saveCompletion({
                    test_id: session.testId,
                    type: "finished",
                    right_answers: finalResult.correctAnswers,
                    wrong_answers:
                        finalResult.totalQuestions - finalResult.correctAnswers,
                    percentage: finalResult.percentage,
                    time_taken: finalResult.timeSpent,
                });
            } catch (e) {
                console.error("Failed to save test completion statistics:", e);
            }
        }

        setResult(finalResult);
        StorageService.saveResult(session.testId, finalResult);
        StorageService.clearSession();
    }, [session, activeQuestions, getDefaultSettings, saveCompletion]);

    useEffect(() => {
        if (!session?.timeLimitSeconds || session.timeLimitSeconds <= 0) {
            setTimeLeftSeconds(null);
            return;
        }

        const limitSeconds = session.timeLimitSeconds;

        const tick = () => {
            const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
            const left = Math.max(0, Math.ceil(limitSeconds - elapsed));
            setTimeLeftSeconds(left);

            if (left <= 0 && !timedOutRef.current) {
                timedOutRef.current = true;
                finishTest();
            }
        };

        tick();
        const id = window.setInterval(tick, 500);
        return () => window.clearInterval(id);
    }, [session?.startTime, session?.timeLimitSeconds, finishTest]);

    const resetTest = useCallback(() => {
        StorageService.clear();
        setSession(null);
        setResult(null);
        setTimeLeftSeconds(null);
        timedOutRef.current = false;
    }, []);

    return {
        session,
        result,
        startTest,
        saveAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        finishTest,
        resetTest,
        updateSettings,
        settings: {
            ...getDefaultSettings(),
            ...(session?.settings ?? settingsDraft ?? {}),
        },
        questions: activeQuestions,
        currentQuestion: session
            ? activeQuestions[session.currentQuestionIndex]
            : null,
        progress: session
            ? ((session.currentQuestionIndex + 1) /
                  Math.max(1, activeQuestions.length)) *
              100
            : 0,
        timeLeftSeconds,
        evaluateAnswer: evaluateAndStore,
        answerEvaluations: session?.answerEvaluations ?? {},
    };
};
