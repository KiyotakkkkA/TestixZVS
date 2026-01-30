import { api } from "../configs/api";

import type { FullAnswerModelEvaluation } from "../types/AI";
import type { FullAnswerCheckMode } from "../types/tests/Test";

export const AIService = {
    fillTestFromText: async (input: { text: string }) => {
        const { data } = await api.post("/ai/fill-test", input);
        return data?.result ?? data;
    },
    gradeFullAnswer: async (input: {
        questionText: string;
        correctAnswers: string[];
        userAnswer: string;
        checkMode?: FullAnswerCheckMode;
    }): Promise<FullAnswerModelEvaluation> => {
        const mode = input.checkMode ?? "medium";
        const { data } = await api.post("/ai/grade-full-answer", {
            questionText: input.questionText,
            correctAnswers: input.correctAnswers,
            userAnswer: input.userAnswer,
            checkMode: mode,
        });

        const result = data?.result ?? data;
        return {
            scorePercent: Number(result?.scorePercent ?? 0),
            comment:
                String(result?.comment ?? "Без комментария.") ||
                "Без комментария.",
        };
    },
};
