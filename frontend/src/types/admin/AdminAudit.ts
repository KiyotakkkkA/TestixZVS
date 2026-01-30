export type AdminAuditActionType =
    | "admin_roles_change"
    | "admin_permissions_change"
    | "admin_user_add"
    | "admin_user_remove"
    | "test_created"
    | "test_updated"
    | "test_deleted"
    | "test_access_updated";

export type AdminAuditActor = {
    id: number;
    name: string;
    email: string;
};

export type AdminAuditUserSnapshot = {
    id: number;
    name: string;
    email: string;
};

export type AdminAuditObjectState = {
    user?: AdminAuditUserSnapshot;
    roles?: string[];
    permissions?: string[];
    test?: {
        id: string;
        title: string;
        link?: string;
    };
    access?: {
        status?: string;
        users?: AdminAuditUserSnapshot[];
    };
    changed_questions?: {
        id?: number;
        title: string;
        type: string;
        action?: "added" | "updated" | "removed";
    }[];
};

export type AdminAuditRecord = {
    id: number;
    action_type: AdminAuditActionType;
    old_object_state?: AdminAuditObjectState | null;
    new_object_state?: AdminAuditObjectState | null;
    comment?: string | null;
    created_at: string;
    actor: AdminAuditActor | null;
};

export type AdminAuditPagination = {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
};

export type AdminAuditResponse = {
    data: AdminAuditRecord[];
    pagination: AdminAuditPagination;
};

export type AdminAuditFilters = {
    action_type?: AdminAuditActionType | "";
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
};
