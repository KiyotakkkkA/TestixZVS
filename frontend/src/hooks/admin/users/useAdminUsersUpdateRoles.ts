import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

export const useAdminUsersUpdateRoles = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        ({ userId, roles }: { userId: number; roles: string[] }) =>
            AdminService.updateUserRoles(userId, roles),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    return {
        updateUserRoles: (userId: number, roles: string[]) =>
            mutation.mutateAsync({ userId, roles }),
        isUpdating: mutation.isLoading,
    };
};
