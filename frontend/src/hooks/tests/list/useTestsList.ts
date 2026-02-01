import { useQuery } from "react-query";

import { TestService } from "../../../services/test";

import type {
    TestListDbItem,
    TestListSort,
} from "../../../types/tests/TestList";

type TestListPagination = {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
};

const DEFAULT_PAGINATION: TestListPagination = {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

const resolveSortParams = (sort: TestListSort) => {
    if (sort === "title_desc") {
        return { sortBy: "title", sortDir: "desc" };
    }
    return { sortBy: "title", sortDir: "asc" };
};

export const useTestsList = (params: {
    sort: TestListSort;
    page: number;
    perPage: number;
}) => {
    const query = useQuery(
        ["tests", "list", params.sort, params.page, params.perPage],
        async () => {
            const { sortBy, sortDir } = resolveSortParams(params.sort);
            return TestService.getTestsList(
                sortBy,
                sortDir,
                params.page,
                params.perPage,
            );
        },
        { keepPreviousData: true },
    );

    return {
        tests: (query.data?.data ?? []) as TestListDbItem[],
        pagination: query.data?.pagination ?? DEFAULT_PAGINATION,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось загрузить тесты")
            : null,
        refetch: query.refetch,
    };
};
