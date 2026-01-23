import { Icon } from '@iconify/react';

import { Button, InputSmall } from '../../../../atoms';

export type SingleChoiceFormProps = {
    options: string[];
    correctAnswers: number[];
    onOptionChange: (index: number, value: string) => void;
    onToggleCorrect: (index: number) => void;
    onAddOption: () => void;
    onRemoveOption: (index: number) => void;
};

export const SingleChoiceForm = ({
    options,
    correctAnswers,
    onOptionChange,
    onToggleCorrect,
    onAddOption,
    onRemoveOption,
}: SingleChoiceFormProps) => {
    return (
        <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Варианты ответа</div>
            <div className="space-y-3">
                {options.map((option, index) => {
                    const isCorrect = correctAnswers.includes(index);
                    return (
                        <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <input
                                    type="radio"
                                    name="single-correct"
                                    checked={isCorrect}
                                    onChange={() => onToggleCorrect(index)}
                                    className="h-4 w-4 accent-indigo-600"
                                />
                                <InputSmall
                                    value={option}
                                    onChange={(event) => onOptionChange(index, event.target.value)}
                                    placeholder={`Вариант ${index + 1}`}
                                    className="border-0 p-0 focus:border-0 hover:border-0"
                                />
                            </label>
                            <Button
                                dangerNoBackground
                                className="p-1 text-xs"
                                onClick={() => onRemoveOption(index)}
                            >
                                <Icon icon="mdi:delete" className="h-6 w-6" />
                            </Button>
                        </div>
                    );
                })}
            </div>
            <Button
                secondary
                className="w-full border-dashed px-4 py-2 text-sm"
                onClick={onAddOption}
            >
                + Добавить вариант
            </Button>
        </div>
    );
};
