import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

import type { AdminTestsAccessStatus } from "../../../types/admin/AdminTestsAccess";

export const useAdminTestsAccessUpdateStatus = () => {
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

    const mutation = useMutation(
        ({
            testId,
            status,
        }: {
            testId: string;
            status: AdminTestsAccessStatus;
        }) => AdminService.updateTestAccess(testId, { access_status: status }),
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
        updateTestAccessStatus: (
            testId: string,
            status: AdminTestsAccessStatus,
        ) => mutation.mutateAsync({ testId, status }).then((resp) => resp.test),
        isUpdating: isUpdating,
    };
};
