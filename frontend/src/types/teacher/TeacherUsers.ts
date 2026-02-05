export type TeacherUserOption = {
    id: number;
    name: string;
    email: string;
};

export type TeacherUserGroup = {
    id: number;
    name: string;
    created_by: number;
    created_at: string;
    updated_at: string;
    participants: TeacherUserOption[];
    participants_count: number;
};

export type TeacherGroupsResponse = {
    data: TeacherUserGroup[];
    pagination?: {
        page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
};

export type TeacherGroupUsersResponse = {
    data: TeacherUserOption[];
};

export type TeacherGroupCreatePayload = {
    name: string;
    user_ids: number[];
};

export type TeacherGroupRenamePayload = {
    name: string;
};

export type TeacherGroupParticipantsPayload = {
    user_ids: number[];
};

export type TeacherRegisterUserPayload = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};
