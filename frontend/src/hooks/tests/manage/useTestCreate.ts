import { useMutation, useQueryClient } from "react-query";

import { TestService } from "../../../services/test";

import type { TestCreationPayload } from "../../../types/tests/TestManagement";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useTestCreate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        (payload: TestCreationPayload) => TestService.createBlankTest(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["tests", "list"]);
            },
        },
    );

    return {
        createTest: mutation.mutateAsync,
        isCreating: mutation.isLoading,
        error: mutation.error
            ? getErrorMessage(mutation.error, "Не удалось создать тест")
            : null,
    };
};
