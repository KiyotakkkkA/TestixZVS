import { InputBig } from "../../../atoms";

import type {
    FullAnswerCheckMode,
    FullAnswerQuestion,
} from "../../../../types/tests/Test";

export type FullAnswerEvaluationView = {
    scorePercent: number;
    comment: string;
};

interface FullAnswerProps {
    question: FullAnswerQuestion;
    userAnswer: string[] | undefined;
    onAnswerChange: (answer: string[]) => void;
    evaluation?: FullAnswerEvaluationView | null;
    fullAnswerCheckMode?: FullAnswerCheckMode;
    checkedState?: "none" | "correct" | "wrong";
    disabled?: boolean;
}

export const FullAnswer = ({
    question,
    userAnswer = [],
    onAnswerChange,
    evaluation = null,
    fullAnswerCheckMode = "medium",
    checkedState = "none",
    disabled = false,
}: FullAnswerProps) => {
    const value = userAnswer[0] ?? "";

    const modeLabels: Record<FullAnswerCheckMode, string> = {
        lite: "Lite",
        medium: "Medium",
        hard: "Hard",
        unreal: "Unreal",
    };

    const modeHints: Record<FullAnswerCheckMode, string> = {
        lite: "Достаточно передать суть ответа.",
        medium: "Нужны ключевые термины и конструкции.",
        hard: "Почти полное воспроизведение ответа.",
        unreal: "Практически дословное совпадение.",
    };

    const baseBorder = "border-gray-300 focus:border-indigo-500";
    const checkedBorder =
        checkedState === "none"
            ? baseBorder
            : checkedState === "correct"
              ? "border-emerald-300 focus:border-emerald-400"
              : "border-rose-300 focus:border-rose-400";

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-gray-600">Введите полный ответ</p>
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
                    Режим проверки: {modeLabels[fullAnswerCheckMode]}
                </span>
                <span className="text-xs text-gray-500">
                    {modeHints[fullAnswerCheckMode]}
                </span>
            </div>
            <InputBig
                value={value}
                onChange={(e) => onAnswerChange([e.target.value])}
                disabled={disabled}
                placeholder="Ваш ответ..."
                className={
                    `w-full min-h-[160px] resize-y px-4 py-3 bg-white` +
                    `${checkedBorder}` +
                    (disabled
                        ? " opacity-80 cursor-not-allowed"
                        : " focus:ring-indigo-200")
                }
            />

            {evaluation ? (
                <>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-indigo-900">
                                Оценка модели
                            </div>
                            <div className="text-sm font-bold text-indigo-900">
                                {Math.round(evaluation.scorePercent)}%
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-indigo-900/90 whitespace-pre-wrap">
                            {evaluation.comment}
                        </div>
                    </div>
                    <div className="rounded-lg shadow-md border px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-indigo-900">
                                Эталонный ответ
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-indigo-900/90 whitespace-pre-wrap">
                            {question.correctAnswers}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};
