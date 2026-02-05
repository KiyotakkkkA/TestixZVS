import { useCallback, useEffect } from "react";

import { teacherGroupsStore } from "../../../stores/teacher/teacherGroupsStore";

export type TeacherGroupUsersFilters = {
    search: string;
    limit: number;
};

export type TeacherGroupsFilters = {
    search: string;
    page: number;
    per_page: number;
};

export const useTeacherGroupsManage = (
    initialFilters?: Partial<TeacherGroupUsersFilters>,
) => {
    useEffect(() => {
        if (initialFilters) {
            teacherGroupsStore.updateUsersFilters(initialFilters);
        }
    }, [initialFilters]);

    const updateUsersFilters = useCallback(
        (next: Partial<TeacherGroupUsersFilters>) => {
            teacherGroupsStore.updateUsersFilters(next);
        },
        [],
    );

    const updateGroupsFilters = useCallback(
        (next: Partial<TeacherGroupsFilters>) => {
            teacherGroupsStore.updateGroupsFilters(next);
        },
        [],
    );

    return {
        usersFilters: teacherGroupsStore.usersFilters,
        usersAppliedFilters: teacherGroupsStore.usersAppliedFilters,
        updateUsersFilters,
        groupsFilters: teacherGroupsStore.groupsFilters,
        groupsAppliedFilters: teacherGroupsStore.groupsAppliedFilters,
        updateGroupsFilters,
    };
};
