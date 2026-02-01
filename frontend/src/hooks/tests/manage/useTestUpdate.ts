import { useMutation, useQueryClient } from "react-query";

import { TestService } from "../../../services/test";

import type { TestUpdatePayload } from "../../../types/tests/TestManagement";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useTestUpdate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        ({ testId, payload }: { testId: string; payload: TestUpdatePayload }) =>
            TestService.updateTest(testId, payload),
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries(["tests", "list"]);
                queryClient.invalidateQueries([
                    "tests",
                    "by-id",
                    variables.testId,
                ]);
            },
        },
    );

    return {
        updateTest: (testId: string, payload: TestUpdatePayload) =>
            mutation.mutateAsync({ testId, payload }),
        isSaving: mutation.isLoading,
        error: mutation.error
            ? getErrorMessage(mutation.error, "Не удалось сохранить тест")
            : null,
    };
};
