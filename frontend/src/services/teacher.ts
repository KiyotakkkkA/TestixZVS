import { api } from "../configs/api";

import type {
    TeacherGroupCreatePayload,
    TeacherGroupParticipantsPayload,
    TeacherGroupRenamePayload,
    TeacherGroupsResponse,
    TeacherGroupUsersResponse,
    TeacherRegisterUserPayload,
    TeacherUserGroup,
    TeacherUserOption,
} from "../types/teacher/TeacherUsers";

export const TeacherService = {
    getGroups: async (params?: {
        search?: string;
        page?: number;
        per_page?: number;
    }): Promise<TeacherGroupsResponse> => {
        const { data } = await api.get<TeacherGroupsResponse>(
            "/teacher/groups",
            { params },
        );
        return data;
    },

    createGroup: async (
        payload: TeacherGroupCreatePayload,
    ): Promise<TeacherUserGroup> => {
        const { data } = await api.post<{ group: TeacherUserGroup }>(
            "/teacher/groups",
            payload,
        );
        return data.group;
    },

    renameGroup: async (
        groupId: number,
        payload: TeacherGroupRenamePayload,
    ): Promise<TeacherUserGroup> => {
        const { data } = await api.patch<{ group: TeacherUserGroup }>(
            `/teacher/groups/${groupId}/name`,
            payload,
        );
        return data.group;
    },

    addGroupParticipants: async (
        groupId: number,
        payload: TeacherGroupParticipantsPayload,
    ): Promise<TeacherUserGroup> => {
        const { data } = await api.post<{ group: TeacherUserGroup }>(
            `/teacher/groups/${groupId}/participants`,
            payload,
        );
        return data.group;
    },

    removeGroupParticipant: async (
        groupId: number,
        userId: number,
    ): Promise<TeacherUserGroup> => {
        const { data } = await api.delete<{ group: TeacherUserGroup }>(
            `/teacher/groups/${groupId}/participants/${userId}`,
        );
        return data.group;
    },

    deleteGroup: async (groupId: number): Promise<void> => {
        await api.delete(`/teacher/groups/${groupId}`);
    },

    getUsers: async (params?: {
        search?: string;
        limit?: number;
    }): Promise<TeacherGroupUsersResponse> => {
        const { data } = await api.get<TeacherGroupUsersResponse>(
            "/teacher/groups/users",
            { params },
        );
        return data;
    },

    registerUser: async (
        payload: TeacherRegisterUserPayload,
    ): Promise<TeacherUserOption> => {
        const { data } = await api.post<{ user: TeacherUserOption }>(
            "/teacher/groups/users",
            payload,
        );
        return data.user;
    },
};
