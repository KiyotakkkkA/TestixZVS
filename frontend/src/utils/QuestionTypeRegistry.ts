import { TestService } from "../services/test";
import { AIService } from "../services/aiWorker";

import {
    SingleChoice,
    MultipleChoice,
    Matching,
    FullAnswer,
} from "../components/molecules/test/answering";

import type { TestSettings, TestQuestion } from "../types/tests/Test";
import type { FullAnswerModelEvaluation } from "../types/AI";

export type AnswerValue = number[] | string[];

export type AnswerEvaluation = {
    correct: boolean;
    scorePercent?: number;
    comment?: string;
};

export const FULL_ANSWER_CORRECT_FROM_PERCENT = (() => {
    const v = Number(
        process.env.REACT_APP_FULL_ANSWER_CORRECT_FROM_PERCENT ?? 70,
    );
    if (!Number.isFinite(v)) return 70;
    return Math.min(100, Math.max(0, Math.round(v)));
})();

const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

export type QuestionTypeHandler<T extends TestQuestion = TestQuestion> = {
    type: T["type"];
    getLocalSettings?: (global: TestSettings | null) => Partial<TestSettings>;
    evaluate: (
        question: T,
        userAnswer: AnswerValue,
        settings?: TestSettings | null,
    ) => Promise<AnswerEvaluation>;
    component?: React.ComponentType<any>;
};

const standardEvaluate = async (
    question: TestQuestion,
    userAnswer: AnswerValue,
    _settings?: TestSettings | null,
): Promise<AnswerEvaluation> => {
    const correct = TestService.isAnswerCorrect(question, userAnswer);
    return { correct, scorePercent: correct ? 100 : 0 };
};

const fullAnswerEvaluate = async (
    question: Extract<TestQuestion, { type: "full_answer" }>,
    userAnswer: AnswerValue,
    settings?: TestSettings | null,
): Promise<AnswerEvaluation> => {
    const ua = Array.isArray(userAnswer) ? (userAnswer as string[]) : [];
    const userText = String(ua[0] ?? "").trim();

    if (!userText) {
        return {
            correct: false,
            scorePercent: 0,
            comment: "Ответ пустой.",
        };
    }

    try {
        const ev: FullAnswerModelEvaluation = await AIService.gradeFullAnswer({
            questionText: question.question,
            correctAnswers: question.correctAnswers,
            userAnswer: userText,
            checkMode: settings?.fullAnswerCheckMode ?? "medium",
        });

        const correct = ev.scorePercent >= FULL_ANSWER_CORRECT_FROM_PERCENT;
        return {
            correct,
            scorePercent: ev.scorePercent,
            comment: ev.comment,
        };
    } catch (e) {
        const allowed = question.correctAnswers.map(normalize);
        const strict = allowed.includes(normalize(userText));
        return {
            correct: strict,
            scorePercent: strict ? 100 : 0,
            comment:
                "Не удалось получить оценку модели. Использована точная проверка по списку правильных ответов.",
        };
    }
};

export const QUESTION_TYPE_HANDLERS: Record<
    TestQuestion["type"],
    QuestionTypeHandler<any>
> = {
    single: {
        type: "single",
        evaluate: standardEvaluate,
        component: SingleChoice,
    },
    multiple: {
        type: "multiple",
        evaluate: standardEvaluate,
        component: MultipleChoice,
    },
    matching: {
        type: "matching",
        evaluate: standardEvaluate,
        component: Matching,
    },
    full_answer: {
        type: "full_answer",
        getLocalSettings: () => ({
            hintsEnabled: false,
            checkAfterAnswer: true,
            showIncorrectAtEnd: true,
        }),
        evaluate: fullAnswerEvaluate,
        component: FullAnswer,
    },
};

export const getEffectiveSettingsForQuestion = (
    question: TestQuestion,
    global: TestSettings | null,
): TestSettings | null => {
    if (!global) return global;
    const handler = QUESTION_TYPE_HANDLERS[question.type];
    const patch = handler.getLocalSettings?.(global);
    return patch ? { ...global, ...patch } : global;
};

export const evaluateAnswer = async (
    question: TestQuestion,
    userAnswer: AnswerValue,
    settings?: TestSettings | null,
): Promise<AnswerEvaluation> => {
    return QUESTION_TYPE_HANDLERS[question.type].evaluate(
        question as any,
        userAnswer,
        settings,
    );
};

export const resolveQuestionComponent = (
    question: TestQuestion,
): React.ComponentType<any> | undefined => {
    return QUESTION_TYPE_HANDLERS[question.type].component;
};
