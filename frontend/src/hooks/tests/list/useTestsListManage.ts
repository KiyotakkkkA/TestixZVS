import { useCallback, useMemo, useState } from "react";

import type { TestListSort } from "../../../types/tests/TestList";

const resolveSortParams = (sort: TestListSort) => {
    if (sort === "title_desc") {
        return { sortBy: "title", sortDir: "desc" };
    }
    return { sortBy: "title", sortDir: "asc" };
};

export const useTestsListManage = () => {
    const [sort, setSortState] = useState<TestListSort>("title_asc");
    const [page, setPageState] = useState(1);
    const perPage = 10;

    const setSort = useCallback((next: TestListSort) => {
        setPageState(1);
        setSortState(next);
    }, []);

    const setPage = useCallback((next: number) => {
        setPageState(Math.max(1, next));
    }, []);

    const resetFilters = useCallback(() => {
        setSortState("title_asc");
        setPageState(1);
    }, []);

    const sortParams = useMemo(() => resolveSortParams(sort), [sort]);

    return {
        sort,
        setSort,
        page,
        perPage,
        setPage,
        resetFilters,
        sortParams,
    };
};
