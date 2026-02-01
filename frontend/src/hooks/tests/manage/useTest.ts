import { useQuery } from "react-query";

import { TestService } from "../../../services/test";

import type { TestDetails } from "../../../types/tests/TestManagement";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useTest = (testId?: string | null) => {
    const query = useQuery(
        ["tests", "by-id", testId],
        async () => {
            if (!testId) return null;
            try {
                const response = await TestService.getTestById(testId);
                return response.test ?? null;
            } catch (e: any) {
                if (e?.response?.status === 404) {
                    return null;
                }
                throw e;
            }
        },
        {
            enabled: Boolean(testId),
            retry: false,
        },
    );

    return {
        test: (query.data ?? null) as TestDetails | null,
        isLoading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось получить тест")
            : null,
        refetch: query.refetch,
    };
};
