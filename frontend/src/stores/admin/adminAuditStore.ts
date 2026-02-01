import { makeAutoObservable } from "mobx";

import type { AdminAuditFilters } from "../../types/admin/AdminAudit";

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class AdminAuditStore {
    auditFilters: AdminAuditFilters = {
        action_type: "",
        date_from: "",
        date_to: "",
        page: 1,
        per_page: 10,
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get auditAppliedFilters(): AdminAuditFilters {
        return {
            ...this.auditFilters,
            action_type: this.auditFilters.action_type || undefined,
            date_from: this.auditFilters.date_from || undefined,
            date_to: this.auditFilters.date_to || undefined,
        };
    }

    updateAuditFilters(next: Partial<AdminAuditFilters>): void {
        const updated = {
            ...this.auditFilters,
            ...next,
        };
        const shouldResetPage = Object.keys(next).some(
            (key) => key !== "page" && key !== "per_page",
        );
        if (shouldResetPage) updated.page = 1;
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.auditFilters as Record<string, any>,
            )
        )
            return;
        this.auditFilters = updated;
    }
}

export const adminAuditStore = new AdminAuditStore();
