import { api } from "../configs/api";

import type {
    TestCreationPayload,
    TestCreationResult,
    TestDetailsResponse,
    TestAutoFillPayload,
    TestAutoFillResponse,
    TestUpdatePayload,
} from "../types/tests/TestManagement";
import type { TestListResponse } from "../types/tests/TestList";
import type {
    PublicTestResponse,
    TestCompletitionStatisticsPayload,
    TestQuestion,
} from "../types/tests/Test";

export const TestService = {
    createBlankTest: async (
        payload: TestCreationPayload,
    ): Promise<TestCreationResult> => {
        const response = await api.post("/workbench/tests", payload);
        return response.data;
    },
    isAnswerCorrect: (
        question: TestQuestion,
        userAnswer: number[] | string[],
    ): boolean => {
        const normalize = (s: string) =>
            s.trim().replace(/\s+/g, " ").toLowerCase();

        if (question.type === "matching") {
            const ua = Array.isArray(userAnswer)
                ? (userAnswer as string[])
                : [];
            return (
                ua.length === question.correctAnswers.length &&
                question.correctAnswers.every((c) => ua.includes(c))
            );
        }

        if (question.type === "single" || question.type === "multiple") {
            const ua = Array.isArray(userAnswer)
                ? (userAnswer as number[])
                : [];
            if (ua.length !== question.correctAnswers.length) return false;
            return question.correctAnswers.every((c) => ua.includes(c));
        }

        if (question.type === "full_answer") {
            const ua = Array.isArray(userAnswer)
                ? (userAnswer as string[])
                : [];
            const text = ua[0] ? normalize(ua[0]) : "";
            const allowed = question.correctAnswers.map(normalize);
            return text.length > 0 && allowed.includes(text);
        }

        return false;
    },
    getTestById: async (testId: string): Promise<TestDetailsResponse> => {
        const response = await api.get(`/workbench/tests/${testId}`);
        return response.data;
    },
    updateTest: async (
        testId: string,
        payload: TestUpdatePayload,
    ): Promise<TestDetailsResponse> => {
        const response = await api.put(`/workbench/tests/${testId}`, payload);
        return response.data;
    },
    autoFillTest: async (
        testId: string,
        payload: TestAutoFillPayload,
    ): Promise<TestAutoFillResponse> => {
        const response = await api.post(
            `/workbench/tests/${testId}/auto-fill`,
            payload,
        );
        return response.data;
    },
    deleteTest: async (testId: string): Promise<void> => {
        const response = await api.delete(`/workbench/tests/${testId}`);
        return response.data;
    },
    getTestsList: async (
        sortBy: string = "title",
        sortDir: string = "asc",
        page: number = 1,
        perPage: number = 10,
    ): Promise<TestListResponse> => {
        const response = await api.get("/tests", {
            params: {
                sort_by: sortBy,
                sort_dir: sortDir,
                page,
                per_page: perPage,
            },
        });
        return response.data;
    },
    getPublicTestById: async (
        testId: string,
        accessLink?: string | null,
    ): Promise<PublicTestResponse> => {
        const response = await api.get(`/tests/${testId}`, {
            params: accessLink ? { access_link: accessLink } : undefined,
        });
        return response.data;
    },
    saveTestCompletionStatistics: async (
        payload: TestCompletitionStatisticsPayload,
    ): Promise<void> => {
        const response = await api.post("/statistics/test", payload);
        return response.data;
    },
    downloadTestPdf: async (testId: string): Promise<void> => {
        const response = await api.get(`/download/test/${testId}/pdf`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers?.["content-disposition"] as
            | string
            | undefined;
        const match = disposition?.match(/filename="?([^";]+)"?/i);
        link.href = url;
        link.download = match?.[1] ?? `test-${testId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    downloadTestJson: async (testId: string): Promise<void> => {
        const response = await api.get(`/download/test/${testId}/json`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers?.["content-disposition"] as
            | string
            | undefined;
        const match = disposition?.match(/filename="?([^";]+)"?/i);
        link.href = url;
        link.download = match?.[1] ?? `test-${testId}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
