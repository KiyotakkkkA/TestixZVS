import { makeAutoObservable, runInAction } from "mobx";

import { AdminService } from "../../services/admin";

import type {
    AdminTestAccessItem,
    AdminTestAccessUser,
    AdminTestsAccessFilters,
    AdminTestsAccessPagination,
    AdminTestsAccessStatus,
} from "../../types/admin/AdminTestsAccess";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class AdminTestsAccessStore {
    tests: AdminTestAccessItem[] = [];
    pagination: AdminTestsAccessPagination = {
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    };
    filters: AdminTestsAccessFilters = {
        sort_by: "title",
        sort_dir: "asc",
        page: 1,
        per_page: 10,
    };

    users: AdminTestAccessUser[] = [];

    isLoading = false;
    isUpdating: Record<string, boolean> = {};
    usersLoading = false;
    error: string | null = null;
    usersError: string | null = null;

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

    async loadTests(): Promise<void> {
        try {
            this.isLoading = true;
            this.error = null;
            const response = await AdminService.getTestsAccessList(
                this.appliedFilters,
            );
            runInAction(() => {
                this.tests = response.data ?? [];
                this.pagination = response.pagination;
            });
        } catch (e: any) {
            runInAction(() => {
                this.error = getErrorMessage(
                    e,
                    "Не удалось загрузить список тестов",
                );
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async loadUsers(search?: string): Promise<void> {
        try {
            this.usersLoading = true;
            this.usersError = null;
            const response = await AdminService.getTestsAccessUsers({
                search,
                limit: 100,
            });
            runInAction(() => {
                this.users = response.data ?? [];
            });
        } catch (e: any) {
            runInAction(() => {
                this.usersError = getErrorMessage(
                    e,
                    "Не удалось загрузить пользователей",
                );
            });
        } finally {
            runInAction(() => {
                this.usersLoading = false;
            });
        }
    }

    async updateTestAccessStatus(
        testId: string,
        status: AdminTestsAccessStatus,
    ): Promise<AdminTestAccessItem> {
        this.isUpdating = { ...this.isUpdating, [testId]: true };
        try {
            const response = await AdminService.updateTestAccess(testId, {
                access_status: status,
            });
            const updated = response.test;
            runInAction(() => {
                this.tests = this.tests.map((item) =>
                    item.id === updated.id ? updated : item,
                );
            });
            return updated;
        } catch (e: any) {
            runInAction(() => {
                this.error = getErrorMessage(e, "Не удалось обновить доступ");
            });
            throw e;
        } finally {
            runInAction(() => {
                const next = { ...this.isUpdating };
                delete next[testId];
                this.isUpdating = next;
            });
        }
    }

    async updateTestAccessUsers(
        testId: string,
        userIds: number[],
    ): Promise<AdminTestAccessItem> {
        this.isUpdating = { ...this.isUpdating, [testId]: true };
        try {
            const response = await AdminService.updateTestAccess(testId, {
                user_ids: userIds,
            });
            const updated = response.test;
            runInAction(() => {
                this.tests = this.tests.map((item) =>
                    item.id === updated.id ? updated : item,
                );
            });
            return updated;
        } catch (e: any) {
            runInAction(() => {
                this.error = getErrorMessage(e, "Не удалось обновить доступ");
            });
            throw e;
        } finally {
            runInAction(() => {
                const next = { ...this.isUpdating };
                delete next[testId];
                this.isUpdating = next;
            });
        }
    }
}

export const adminTestsAccessStore = new AdminTestsAccessStore();
