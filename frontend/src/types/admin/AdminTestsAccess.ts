export type AdminTestsAccessStatus = "all" | "auth" | "protected" | "link";

export type AdminTestAccessUser = {
    id: number;
    name: string;
    email: string;
};

export type AdminTestAccessItem = {
    id: string;
    title: string;
    total_questions: number;
    total_disabled?: number;
    access_status: AdminTestsAccessStatus;
    access_link?: string | null;
    access_users: AdminTestAccessUser[];
};

export type AdminTestsAccessPagination = {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
};

export type AdminTestsAccessResponse = {
    data: AdminTestAccessItem[];
    pagination: AdminTestsAccessPagination;
};

export type AdminTestsAccessUpdatePayload = {
    access_status?: AdminTestsAccessStatus;
    user_ids?: number[];
};

export type AdminTestsAccessUsersResponse = {
    data: AdminTestAccessUser[];
};

export type AdminTestsAccessFilters = {
    sort_by?: "title";
    sort_dir?: "asc" | "desc";
    page?: number;
    per_page?: number;
};
