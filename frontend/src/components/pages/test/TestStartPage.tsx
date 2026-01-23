import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { Button, InputSlider, SlidedPanel, SwitchRow } from '../../atoms';
import { ExpressTestModal } from '../../molecules/modals';
import { useTest } from '../../../hooks/useTest';
import { TESTS } from '../../../tests';

export const TestStartPage: React.FC = () => {

    const [isOpenSlided, setIsOpenSlided] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const navigate = useNavigate();

    const testId = useParams<{ testId: string }>().testId;
    const test = TESTS.find(t => t.uuid === testId);

    const fullAnswerModes = [
        { value: 'lite', title: 'Lite', description: 'Достаточно передать суть ответа' },
        { value: 'medium', title: 'Medium', description: 'Нужны ключевые термины и конструкции' },
        { value: 'hard', title: 'Hard', description: 'Почти полное воспроизведение ответа' },
        { value: 'unreal', title: 'Unreal', description: 'Практически дословное совпадение' },
    ] as const;

    const {
        settings,
        updateSettings,
        startTest,
        session,
    } = useTest(testId || '', test?.questions || []);

    useEffect(() => {
        if (!testId) return;
        if (!session) return;
        if (session.testId !== testId) return;
        if (session.mode && session.mode !== 'normal') return;
        navigate(`/tests/${testId}`, { replace: true });
    }, [navigate, session, testId]);

    if (!test) {
        return <div>Тест не найден</div>;
    }

    return (
        <div className="w-full max-w-2xl space-y-8 m-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center space-y-6">
                <div className='flex justify-between'>
                    <Button
                        onClick={() => { navigate('/') }}
                        primaryNoBackground
                        className="text-md font-medium flex items-center gap-2"
                    >
                        <Icon icon="mdi:arrow-left" className="h-7 w-7" />
                        Назад
                    </Button>
                    <Button
                        onClick={() => setIsOpenSlided(true)}
                        primaryNoBackground
                    >
                        <Icon icon="mdi:cog" className="h-7 w-7" />
                    </Button>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{test.discipline_name}</h2>
                    <div className="flex items-center justify-center gap-2 text-gray-700">
                        <span className="text-lg font-semibold">{test.questions.length} вопросов</span>
                    </div>
                </div>

                <div className="space-y-3 text-left bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800">Как это работает:</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">
                                1
                            </span>
                            <span>Вам будут предложены вопросы разных типов</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">
                                2
                            </span>
                            <span>Вы можете перемещаться между вопросами</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center">
                                3
                            </span>
                            <span>После завершения вы увидите результат и оценку</span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={() => {
                        startTest({ mode: 'normal' });
                        navigate(`/tests/${test.uuid}`);
                    }}
                    primary
                    className="w-full py-3.5 text-xl font-medium tracking-tight"
                    >
                    Начать тестирование
                </Button>

                <Button
                    onClick={() => setIsOpenModal(true)}
                    secondary
                    className="w-full py-3.5 text-xl font-medium tracking-tight"
                    >
                    Сгенерировать экспресс-тест
                </Button>
            </div>
            <SlidedPanel open={isOpenSlided} onClose={() => setIsOpenSlided(false)} title={
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Настройки
                </h2>
            }>
                <div className="px-6 py-4 overflow-y-auto">
                    <div className="py-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <div>
                                <div className="font-semibold text-gray-800">Порог прохода</div>
                                <div className="text-sm text-gray-600 mt-1">Минимум правильных ответов</div>
                            </div>
                            <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1">
                                {settings.passThreshold} / {test.questions.length}
                            </div>
                        </div>

                        <InputSlider
                            min={1}
                            max={Math.max(1, test.questions.length)}
                            step={1}
                            value={Math.min(Math.max(1, settings.passThreshold), Math.max(1, test.questions.length))}
                            onChange={(value) => updateSettings({ passThreshold: value })}
                        />
                    </div>

                    <div className="border-t border-gray-200" />

                    <SwitchRow
                        title="Включить подсказки во время теста"
                        description="Показывает дополнительную кнопку, подсвечивающую правильные ответы"
                        checked={settings.hintsEnabled}
                        onChange={(checked) => updateSettings({ hintsEnabled: checked })}
                    />

                    <div className="border-t border-gray-200" />

                    <SwitchRow
                        title="Проверять вопрос после ответа"
                        description="После нажатия 'Далее' выполняется автопроверка"
                        checked={settings.checkAfterAnswer}
                        onChange={(checked) => updateSettings({ checkAfterAnswer: checked })}
                    />

                    <div className="border-t border-gray-200" />

                    <div className="py-4">
                        <div className="font-semibold text-gray-800">Режим проверки для полного ответа</div>
                        <div className="text-sm text-gray-600 mt-1">Определяет строгость оценки AI</div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {fullAnswerModes.map((mode) => (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() => updateSettings({ fullAnswerCheckMode: mode.value })}
                                    className={
                                        `rounded-lg border px-4 py-3 text-left transition-colors ` +
                                        (settings.fullAnswerCheckMode === mode.value
                                            ? 'border-indigo-200 bg-indigo-50'
                                            : 'border-gray-200 bg-white hover:bg-gray-50')
                                    }
                                >
                                    <div className="font-semibold text-gray-900">{mode.title}</div>
                                    <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200" />

                    <SwitchRow
                        title="Отображать неправильные ответы в конце теста"
                        description="Показывает вопросы, где были допущены ошибки и правильные ответы"
                        checked={settings.showIncorrectAtEnd}
                        onChange={(checked) => updateSettings({ showIncorrectAtEnd: checked })}
                    />
                </div>
            </SlidedPanel>
            <ExpressTestModal
                test={test}
                open={isOpenModal}
                totalQuestions={test.questions.length}
                onClose={() => setIsOpenModal(false)}
            />
        </div>
    );
};
