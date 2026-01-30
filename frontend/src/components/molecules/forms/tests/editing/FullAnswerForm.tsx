import { Icon } from "@iconify/react";

import { Button, InputBig } from "../../../../atoms";

export type FullAnswerFormProps = {
    answers: string[];
    onAnswerChange: (index: number, value: string) => void;
    onAddAnswer: () => void;
    onRemoveAnswer: (index: number) => void;
};

export const FullAnswerForm = ({
    answers,
    onAnswerChange,
    onAddAnswer,
    onRemoveAnswer,
}: FullAnswerFormProps) => {
    return (
        <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Корректные ответы
            </div>
            <div className="space-y-3">
                {answers.map((answer, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <InputBig
                            value={answer}
                            onChange={(event) =>
                                onAnswerChange(index, event.target.value)
                            }
                            placeholder={`Ответ ${index + 1}`}
                            className="w-full p-2"
                        />
                        <Button
                            dangerNoBackground
                            className="p-1 text-xs"
                            onClick={() => onRemoveAnswer(index)}
                        >
                            <Icon icon="mdi:delete" className="h-6 w-6" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                secondary
                className="w-full border-dashed px-4 py-2 text-sm"
                onClick={onAddAnswer}
            >
                + Добавить ответ
            </Button>
        </div>
    );
};
