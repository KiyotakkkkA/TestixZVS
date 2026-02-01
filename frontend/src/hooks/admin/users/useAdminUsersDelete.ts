import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

export const useAdminUsersDelete = () => {
    const queryClient = useQueryClient();
    const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});

    const mutation = useMutation(
        (userId: number) => AdminService.deleteUser(userId),
        {
            onMutate: (userId) => {
                setDeletingIds((prev) => ({ ...prev, [userId]: true }));
            },
            onSettled: (_data, _error, userId) => {
                setDeletingIds((prev) => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    return {
        deleteUser: mutation.mutateAsync,
        deletingIds,
    };
};
