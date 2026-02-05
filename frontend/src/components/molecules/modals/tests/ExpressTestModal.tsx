import { useNavigate } from "react-router-dom";

import { Modal } from "../../../atoms";
import {
    ExpressTestForm,
    type ExpressTestConfig,
} from "../../forms/tests/ExpressTestForm";
import { useTestPassing } from "../../../../hooks/tests/passing";
import { Test } from "../../../../types/tests/Test";

interface ExpressTestModalProps {
    test: Test;
    open: boolean;
    totalQuestions: number;
    onClose: () => void;
}

export const ExpressTestModal = ({
    test,
    open,
    totalQuestions,
    onClose,
}: ExpressTestModalProps) => {
    const { startTest } = useTestPassing(test.uuid, test.questions);

    const navigate = useNavigate();
    const calculateQuestionIds = (count: number, passThreshold: number) => {
        const total = test.questions.length;
        const safeCount = Math.min(Math.max(1, count), Math.max(1, total));
        const passThresholdClamped = Math.min(
            Math.max(1, passThreshold),
            safeCount,
        );

        const ids = test.questions.map((q) => q.id);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        return {
            questionIds: ids.slice(0, safeCount),
            passThreshold: passThresholdClamped,
        };
    };

    const handleStart = (config: ExpressTestConfig) => {
        const { questionIds, passThreshold } = calculateQuestionIds(
            config.questionCount,
            config.passThreshold,
        );

        const timeLimitSeconds = config.timeLimitEnabled
            ? Math.max(60, Math.round(config.timeLimitMinutes * 60))
            : undefined;

        startTest({
            mode: "express",
            questionIds,
            timeLimitSeconds,
            settings: {
                passThreshold,
                hintsEnabled: false,
                checkAfterAnswer: false,
                showIncorrectAtEnd: true,
                fullAnswerCheckMode: config.fullAnswerCheckMode,
            },
        });
        navigate(`/tests/${test.uuid}`);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent">
                    Экспресс-тест
                </h2>
            }
        >
            <ExpressTestForm
                open={open}
                totalQuestions={totalQuestions}
                onStart={handleStart}
            />
        </Modal>
    );
};
