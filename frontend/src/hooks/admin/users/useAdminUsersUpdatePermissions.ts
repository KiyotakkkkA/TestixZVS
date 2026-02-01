import { useMutation, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

export const useAdminUsersUpdatePermissions = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation(
        ({ userId, perms }: { userId: number; perms: string[] }) =>
            AdminService.updateUserPermissions(userId, perms),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    return {
        updateUserPermissions: (userId: number, perms: string[]) =>
            mutation.mutateAsync({ userId, perms }),
        isUpdating: mutation.isLoading,
    };
};
