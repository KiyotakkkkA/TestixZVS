import { makeAutoObservable } from "mobx";

type TeacherGroupUsersFilters = {
    search: string;
    limit: number;
};

type TeacherGroupsFilters = {
    search: string;
    page: number;
    per_page: number;
};

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class TeacherGroupsStore {
    usersFilters: TeacherGroupUsersFilters = {
        search: "",
        limit: 100,
    };

    groupsFilters: TeacherGroupsFilters = {
        search: "",
        page: 1,
        per_page: 10,
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get usersAppliedFilters(): Partial<TeacherGroupUsersFilters> {
        return {
            search: this.usersFilters.search || undefined,
            limit: this.usersFilters.limit || undefined,
        };
    }

    get groupsAppliedFilters(): Partial<TeacherGroupsFilters> {
        return {
            search: this.groupsFilters.search || undefined,
            page: this.groupsFilters.page,
            per_page: this.groupsFilters.per_page,
        };
    }

    updateUsersFilters(next: Partial<TeacherGroupUsersFilters>): void {
        const updated = { ...this.usersFilters, ...next };
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.usersFilters as Record<string, any>,
            )
        )
            return;
        this.usersFilters = updated;
    }

    updateGroupsFilters(next: Partial<TeacherGroupsFilters>): void {
        const updated = { ...this.groupsFilters, ...next };
        const shouldResetPage = Object.keys(next).some(
            (key) => key !== "page" && key !== "per_page",
        );
        if (shouldResetPage) updated.page = 1;
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.groupsFilters as Record<string, any>,
            )
        )
            return;
        this.groupsFilters = updated;
    }
}

export const teacherGroupsStore = new TeacherGroupsStore();
