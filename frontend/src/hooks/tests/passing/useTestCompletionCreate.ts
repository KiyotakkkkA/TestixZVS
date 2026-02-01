import { useMutation } from "react-query";

import { TestService } from "../../../services/test";

import type { TestCompletitionStatisticsPayload } from "../../../types/tests/Test";

export const useTestCompletionCreate = () => {
    const mutation = useMutation((payload: TestCompletitionStatisticsPayload) =>
        TestService.saveTestCompletionStatistics(payload),
    );

    return {
        saveCompletion: mutation.mutateAsync,
        isSaving: mutation.isLoading,
    };
};
