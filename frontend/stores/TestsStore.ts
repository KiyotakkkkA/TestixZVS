import { makeAutoObservable, runInAction } from "mobx";
import { GET } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import type { AvailableTest, SortDirection, SortOption } from "@/models/Test";
export type { AvailableTest, SortDirection, SortOption } from "@/models/Test";

export type TestsPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
};

export type TestsListResponse = {
  data: AvailableTest[];
  meta: TestsPaginationMeta;
};

export class TestsStore {
  tests: AvailableTest[] = [];
  query = "";
  sortBy: SortOption = "createdAt";
  sortDirection: SortDirection = "desc";
  page = 1;
  perPage = 20;
  meta: TestsPaginationMeta = {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
    from: null,
    to: null,
  };
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filteredTests() {
    return this.tests;
  }

  loadTests = async () => {
    this.loading = true;
    this.error = null;

    const params = new URLSearchParams({
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      page: String(this.page),
      perPage: String(this.perPage),
    });

    const normalizedQuery = this.query.trim();

    if (normalizedQuery) {
      params.set("search", normalizedQuery);
    }

    const response = await GET<TestsListResponse>(
      `${endpoints.tests.list}?${params.toString()}`,
    );

    runInAction(() => {
      if (response.ok) {
        this.tests = response.data.data;
        this.meta = response.data.meta;

        if (response.data.meta.currentPage !== this.page) {
          this.page = response.data.meta.currentPage;
        }
      } else {
        this.error = response.data.message;
      }

      this.loading = false;
    });
  };

  setQuery = (query: string) => {
    this.query = query;
    this.page = 1;
  };

  setSortBy = (sortBy: SortOption) => {
    this.sortBy = sortBy;
    this.page = 1;
  };

  toggleSortDirection = () => {
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    this.page = 1;
  };

  setPage = (page: number) => {
    this.page = page;
  };

  setPerPage = (perPage: number) => {
    this.perPage = perPage;
    this.page = 1;
  };

  resetFilters = () => {
    this.query = "";
    this.sortBy = "createdAt";
    this.sortDirection = "desc";
    this.page = 1;
  };
}

export const testsStore = new TestsStore();
