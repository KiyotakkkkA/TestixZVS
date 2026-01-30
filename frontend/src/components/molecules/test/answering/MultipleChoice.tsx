import type { MultipleChoiceQuestion } from "../../../../types/tests/Test";

interface MultipleChoiceProps {
    question: MultipleChoiceQuestion;
    userAnswer: number[] | undefined;
    onAnswerChange: (answer: number[]) => void;
    revealCorrect?: boolean;
    checkedState?: "none" | "correct" | "wrong";
    disabled?: boolean;
}

export const MultipleChoice = ({
    question,
    userAnswer = [],
    onAnswerChange,
    revealCorrect = false,
    checkedState = "none",
    disabled = false,
}: MultipleChoiceProps) => {
    const toggleOption = (index: number) => {
        if (disabled) return;
        const newAnswer = userAnswer.includes(index)
            ? userAnswer.filter((i) => i !== index)
            : [...userAnswer, index];
        onAnswerChange(newAnswer);
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
                Выберите все правильные ответы
            </p>
            {question.options.map((option, index) => (
                <label
                    key={index}
                    className={(() => {
                        const isCorrect =
                            question.correctAnswers.includes(index);
                        const isSelected = userAnswer.includes(index);

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
                        type="checkbox"
                        value={index}
                        checked={userAnswer.includes(index)}
                        onChange={() => toggleOption(index)}
                        disabled={disabled}
                        className="w-5 h-5 text-indigo-600 accent-indigo-600 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="ml-4 text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    );
};
