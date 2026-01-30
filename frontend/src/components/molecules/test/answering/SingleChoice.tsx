import type { SingleChoiceQuestion } from "../../../../types/tests/Test";

interface SingleChoiceProps {
    question: SingleChoiceQuestion;
    userAnswer: number[] | undefined;
    onAnswerChange: (answer: number[]) => void;
    revealCorrect?: boolean;
    checkedState?: "none" | "correct" | "wrong";
    disabled?: boolean;
}

export const SingleChoice = ({
    question,
    userAnswer,
    onAnswerChange,
    revealCorrect = false,
    checkedState = "none",
    disabled = false,
}: SingleChoiceProps) => {
    const selected = userAnswer ?? [];
    return (
        <div className="space-y-3">
            {question.options.map((option, index) => (
                <label
                    key={index}
                    className={(() => {
                        const isCorrect =
                            question.correctAnswers.includes(index);
                        const isSelected = selected.includes(index);

                        if (revealCorrect && isCorrect) {
                            return "flex items-center p-4 border-2 border-emerald-200 bg-emerald-50 rounded-lg cursor-pointer transition-all";
                        }

                        if (
                            checkedState === "wrong" &&
                            isSelected &&
                            !isCorrect
                        ) {
                            return "flex items-center p-4 border-2 border-rose-200 bg-rose-50 rounded-lg cursor-pointer transition-all";
                        }

                        return "flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50";
                    })()}
                >
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={index}
                        checked={userAnswer?.includes(index) || false}
                        onChange={() => onAnswerChange([index])}
                        disabled={disabled}
                        className="w-5 h-5 text-indigo-600 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="ml-4 text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    );
};
