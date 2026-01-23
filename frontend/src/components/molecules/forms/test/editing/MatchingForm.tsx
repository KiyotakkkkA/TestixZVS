import { Icon } from '@iconify/react';

import { Button, InputSmall, Selector } from '../../../../atoms';

export type MatchingFormProps = {
    terms: string[];
    meanings: string[];
    matches: string[];
    onTermChange: (index: number, value: string) => void;
    onMeaningChange: (index: number, value: string) => void;
    onMatchChange: (meaningIndex: number, termKey: string) => void;
    onAddTerm: () => void;
    onAddMeaning: () => void;
    onRemoveTerm: (index: number) => void;
    onRemoveMeaning: (index: number) => void;
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const MatchingForm = ({
    terms,
    meanings,
    matches,
    onTermChange,
    onMeaningChange,
    onMatchChange,
    onAddTerm,
    onAddMeaning,
    onRemoveTerm,
    onRemoveMeaning,
}: MatchingFormProps) => {
    const termOptions = terms.map((_, index) => ({
        value: alphabet[index] ?? String(index + 1),
        label: alphabet[index] ?? String(index + 1),
    }));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Термины</div>
                    {terms.map((term, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-7 text-xs font-semibold text-indigo-500">{alphabet[index] ?? index + 1}</div>
                            <InputSmall
                                value={term}
                                onChange={(event) => onTermChange(index, event.target.value)}
                                placeholder={`Термин ${alphabet[index] ?? index + 1}`}
                                className="w-full"
                            />
                            <Button
                                dangerNoBackground
                                className="p-1 text-xs"
                                onClick={() => onRemoveTerm(index)}
                            >
                                <Icon icon="mdi:delete" className="h-6 w-6" />
                            </Button>
                        </div>
                    ))}
                    <Button secondary className="w-full border-dashed px-4 py-2 text-sm" onClick={onAddTerm}>
                        + Добавить термин
                    </Button>
                </div>

                <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Определения</div>
                    {meanings.map((meaning, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-7 text-xs font-semibold text-emerald-500">{index + 1}</div>
                            <InputSmall
                                value={meaning}
                                onChange={(event) => onMeaningChange(index, event.target.value)}
                                placeholder={`Определение ${index + 1}`}
                                className="w-full"
                            />
                            <Button
                                dangerNoBackground
                                className="p-1 text-xs"
                                onClick={() => onRemoveMeaning(index)}
                            >
                                <Icon icon="mdi:delete" className="h-6 w-6" />
                            </Button>
                        </div>
                    ))}
                    <Button secondary className="w-full border-dashed px-4 py-2 text-sm" onClick={onAddMeaning}>
                        + Добавить определение
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Соответствия</div>
                <div className="grid gap-3 md:grid-cols-2">
                    {meanings.map((meaning, index) => (
                        <div key={`match-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2">
                            <div className="text-xs text-slate-500">{index + 1}.</div>
                            <div className="flex-1 truncate text-sm text-slate-600">{meaning || `Определение ${index + 1}`}</div>
                            <div className="w-36">
                                <Selector
                                    value={matches[index] ?? ''}
                                    options={[{ value: '', label: '—' }, ...termOptions]}
                                    onChange={(value) => onMatchChange(index, value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
