import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

export const useAdminTestsAccessUpdateUsers = () => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

    const mutation = useMutation(
        ({ testId, userIds }: { testId: string; userIds: number[] }) =>
            AdminService.updateTestAccess(testId, { user_ids: userIds }),
        {
            onMutate: ({ testId }) => {
                setIsUpdating((prev) => ({ ...prev, [testId]: true }));
            },
            onSettled: (_data, _error, variables) => {
                setIsUpdating((prev) => {
                    const next = { ...prev };
                    delete next[variables.testId];
                    return next;
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "tests-access"]);
            },
        },
    );

    return {
        updateTestAccessUsers: (testId: string, userIds: number[]) =>
            mutation.mutateAsync({ testId, userIds }).then((resp) => resp.test),
        isUpdating,
    };
};
