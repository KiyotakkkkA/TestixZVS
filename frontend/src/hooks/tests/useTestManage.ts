import { useCallback, useState } from "react";

import { TestService } from "../../services/test";

import type {
    ChangedQuestion,
    TestCreationPayload,
    TestCreationResult,
    TestDetails,
    TestUpdatePayload,
} from "../../types/tests/TestManagement";

export type TestUpdateResult = {
    test: TestDetails | null;
    changedQuestions: ChangedQuestion[];
};

export const useTestManage = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBlankTest = useCallback(
        async (
            payload: TestCreationPayload,
        ): Promise<TestCreationResult | null | undefined> => {
            try {
                setIsCreating(true);
                setError(null);
                const result = await TestService.createBlankTest(payload);
                return result;
            } catch (e: any) {
                setError(
                    e?.response?.data?.message || "Не удалось создать тест",
                );
            } finally {
                setIsCreating(false);
            }
        },
        [],
    );

    const getTestById = useCallback(
        async (testId: string): Promise<TestDetails | null> => {
            try {
                setIsFetching(true);
                setError(null);
                const result = await TestService.getTestById(testId);
                return result.test;
            } catch (e: any) {
                if (e?.response?.status === 404) {
                    return null;
                }
                setError(
                    e?.response?.data?.message || "Не удалось получить тест",
                );
                return null;
            } finally {
                setIsFetching(false);
            }
        },
        [],
    );

    const updateTest = useCallback(
        async (
            testId: string,
            payload: TestUpdatePayload,
        ): Promise<TestUpdateResult | null> => {
            try {
                setIsSaving(true);
                setError(null);
                const result = await TestService.updateTest(testId, payload);
                return {
                    test: result.test ?? null,
                    changedQuestions: result.changedQuestions ?? [],
                };
            } catch (e: any) {
                if (e?.response?.status === 404) {
                    return null;
                }
                setError(
                    e?.response?.data?.message || "Не удалось сохранить тест",
                );
                return null;
            } finally {
                setIsSaving(false);
            }
        },
        [],
    );

    const deleteTest = useCallback(async (testId: string): Promise<boolean> => {
        try {
            setIsSaving(true);
            setError(null);
            await TestService.deleteTest(testId);
            return true;
        } catch (e: any) {
            if (e?.response?.status === 404) {
                return false;
            }
            setError(e?.response?.data?.message || "Не удалось удалить тест");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, []);

    return {
        createBlankTest,
        getTestById,
        updateTest,
        deleteTest,
        isCreating,
        isFetching,
        isSaving,
        error,
    };
};
