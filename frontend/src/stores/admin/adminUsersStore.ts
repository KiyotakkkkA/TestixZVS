import { makeAutoObservable } from "mobx";

import type { AdminUsersFilters } from "../../types/admin/AdminUsers";

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class AdminUsersStore {
    usersFilters: AdminUsersFilters = {
        search: "",
        role: "",
        permissions: [],
        page: 1,
        per_page: 10,
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get usersAppliedFilters(): AdminUsersFilters {
        return {
            search: this.usersFilters.search || undefined,
            role: this.usersFilters.role || undefined,
            permissions:
                this.usersFilters.permissions &&
                this.usersFilters.permissions.length
                    ? this.usersFilters.permissions
                    : undefined,
            page: this.usersFilters.page,
            per_page: this.usersFilters.per_page,
        };
    }

    updateUsersFilters(next: Partial<AdminUsersFilters>): void {
        const updated = { ...this.usersFilters, ...next };
        const shouldResetPage = Object.keys(next).some(
            (key) => key !== "page" && key !== "per_page",
        );
        if (shouldResetPage) updated.page = 1;
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.usersFilters as Record<string, any>,
            )
        )
            return;
        this.usersFilters = updated;
    }
}

export const adminUsersStore = new AdminUsersStore();
