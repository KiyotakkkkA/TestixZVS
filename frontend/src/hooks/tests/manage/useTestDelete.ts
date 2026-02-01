import { useMutation, useQueryClient } from "react-query";

import { TestService } from "../../../services/test";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useTestDelete = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        (testId: string) => TestService.deleteTest(testId),
        {
            onSuccess: (_data, testId) => {
                queryClient.invalidateQueries(["tests", "list"]);
                queryClient.invalidateQueries(["tests", "by-id", testId]);
            },
        },
    );

    return {
        deleteTest: mutation.mutateAsync,
        isSaving: mutation.isLoading,
        error: mutation.error
            ? getErrorMessage(mutation.error, "Не удалось удалить тест")
            : null,
    };
};
