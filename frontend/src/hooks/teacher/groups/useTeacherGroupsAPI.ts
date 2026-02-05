import { useMutation, useQuery, useQueryClient } from "react-query";

import { TeacherService } from "../../../services/teacher";

import type {
    TeacherGroupCreatePayload,
    TeacherGroupParticipantsPayload,
    TeacherGroupRenamePayload,
    TeacherRegisterUserPayload,
} from "../../../types/teacher/TeacherUsers";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useTeacherGroupsAPI = (params?: {
    groups?: {
        search?: string;
        page?: number;
        per_page?: number;
    };
    users?: {
        search?: string;
        limit?: number;
    };
}) => {
    const queryClient = useQueryClient();

    const groupsQuery = useQuery(["teacher", "groups", params?.groups], () =>
        TeacherService.getGroups(params?.groups),
    );

    const usersQuery = useQuery(
        ["teacher", "groups", "users", params?.users],
        () => TeacherService.getUsers(params?.users),
    );

    const createMutation = useMutation(
        (payload: TeacherGroupCreatePayload) =>
            TeacherService.createGroup(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups"]);
            },
        },
    );

    const renameMutation = useMutation(
        ({
            groupId,
            payload,
        }: {
            groupId: number;
            payload: TeacherGroupRenamePayload;
        }) => TeacherService.renameGroup(groupId, payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups"]);
            },
        },
    );

    const addUsersMutation = useMutation(
        ({
            groupId,
            payload,
        }: {
            groupId: number;
            payload: TeacherGroupParticipantsPayload;
        }) => TeacherService.addGroupParticipants(groupId, payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups"]);
            },
        },
    );

    const removeUserMutation = useMutation(
        ({ groupId, userId }: { groupId: number; userId: number }) =>
            TeacherService.removeGroupParticipant(groupId, userId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups"]);
            },
        },
    );

    const deleteGroupMutation = useMutation(
        (groupId: number) => TeacherService.deleteGroup(groupId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups"]);
            },
        },
    );

    const registerUserMutation = useMutation(
        (payload: TeacherRegisterUserPayload) =>
            TeacherService.registerUser(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["teacher", "groups", "users"]);
            },
        },
    );

    return {
        groups: groupsQuery.data?.data ?? [],
        groupsPagination: groupsQuery.data?.pagination ?? {
            page: 1,
            per_page: 10,
            total: 0,
            last_page: 1,
        },
        groupsLoading: groupsQuery.isLoading,
        groupsFetching: groupsQuery.isFetching,
        groupsError: groupsQuery.error
            ? getErrorMessage(groupsQuery.error, "Ошибка загрузки групп")
            : null,
        users: usersQuery.data?.data ?? [],
        usersLoading: usersQuery.isLoading,
        usersFetching: usersQuery.isFetching,
        usersError: usersQuery.error
            ? getErrorMessage(usersQuery.error, "Ошибка загрузки пользователей")
            : null,
        createGroup: createMutation.mutateAsync,
        isCreatingGroup: createMutation.isLoading,
        renameGroup: renameMutation.mutateAsync,
        isRenamingGroup: renameMutation.isLoading,
        addUsers: addUsersMutation.mutateAsync,
        isAddingUsers: addUsersMutation.isLoading,
        removeUser: removeUserMutation.mutateAsync,
        isRemovingUser: removeUserMutation.isLoading,
        deleteGroup: deleteGroupMutation.mutateAsync,
        isDeletingGroup: deleteGroupMutation.isLoading,
        createUser: registerUserMutation.mutateAsync,
        isCreatingUser: registerUserMutation.isLoading,
    };
};
