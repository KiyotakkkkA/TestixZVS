import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

import type { AdminCreateUserPayload } from "../../../types/admin/AdminUsers";

export const useAdminUsersCreate = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        (payload: AdminCreateUserPayload) => AdminService.createUser(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    return {
        createUser: mutation.mutateAsync,
        isAdding: mutation.isLoading,
    };
};
