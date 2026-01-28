import { useCallback, useEffect, useMemo, useState } from 'react';

import { TestService } from '../../services/test';

import type { TestListDbItem, TestListResponse, TestListSort } from '../../types/TestList';

export type UseTestsListResult = {
  tests: TestListDbItem[];
  isLoading: boolean;
  error: string | null;
  sort: TestListSort;
  setSort: (next: TestListSort) => void;
  page: number;
  perPage: number;
  lastPage: number;
  total: number;
  setPage: (next: number) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  sortParams: { sortBy: string; sortDir: string };
};

const resolveSortParams = (sort: TestListSort) => {
  if (sort === 'title_desc') {
    return { sortBy: 'title', sortDir: 'desc' };
  }
  return { sortBy: 'title', sortDir: 'asc' };
};

export const useTestsList = (): UseTestsListResult => {
  const [tests, setTests] = useState<TestListDbItem[]>([]);
  const [sort, setSort] = useState<TestListSort>('title_asc');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortParams = useMemo(() => resolveSortParams(sort), [sort]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: TestListResponse = await TestService.getTestsList(sortParams.sortBy, sortParams.sortDir, page, perPage);
      setTests(response.data ?? []);
      setLastPage(response.pagination?.last_page ?? 1);
      setTotal(response.pagination?.total ?? 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Не удалось загрузить тесты');
    } finally {
      setIsLoading(false);
    }
  }, [sortParams.sortBy, sortParams.sortDir, page, perPage]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    tests,
    isLoading,
    error,
    sort,
    setSort: (next) => {
      setPage(1);
      setSort(next);
    },
    page,
    perPage,
    lastPage,
    total,
    setPage,
    resetFilters: () => {
      setSort('title_asc');
      setPage(1);
    },
    refresh: load,
    sortParams,
  };
};
