import { makeAutoObservable } from "mobx";

import type { AdminTestsAccessFilters } from "../../types/admin/AdminTestsAccess";

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class AdminTestsAccessStore {
    filters: AdminTestsAccessFilters = {
        sort_by: "title",
        sort_dir: "asc",
        page: 1,
        per_page: 10,
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get appliedFilters(): AdminTestsAccessFilters {
        return {
            sort_by: this.filters.sort_by ?? "title",
            sort_dir: this.filters.sort_dir ?? "asc",
            page: this.filters.page ?? 1,
            per_page: this.filters.per_page ?? 10,
        };
    }

    updateFilters(next: Partial<AdminTestsAccessFilters>): void {
        const updated = { ...this.filters, ...next };
        const shouldResetPage = Object.keys(next).some(
            (key) => key !== "page" && key !== "per_page",
        );
        if (shouldResetPage) updated.page = 1;
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.filters as Record<string, any>,
            )
        )
            return;
        this.filters = updated;
    }
}

export const adminTestsAccessStore = new AdminTestsAccessStore();
