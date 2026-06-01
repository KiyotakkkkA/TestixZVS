import { makeAutoObservable, runInAction } from "mobx";
import { GET } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import type { User, UserStatus } from "@/models/User";

export type AdminUser = User;
export type AdminUserStatus = UserStatus;
export type UserStatusFilter = UserStatus | "all";
export type UserSortOption = "name" | "status" | "role";
export type UserSortDirection = "asc" | "desc";

export type UsersPaginationMeta = {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
};

export type UsersListResponse = {
  data: User[];
  meta: UsersPaginationMeta;
};

export class UsersStore {
  users: User[] = [];
  query = "";
  selectedStatus: UserStatusFilter = "all";
  sortBy: UserSortOption = "name";
  sortDirection: UserSortDirection = "asc";
  page = 1;
  perPage = 10;
  meta: UsersPaginationMeta = {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    from: null,
    to: null,
  };
  selectedUser: User | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filteredUsers() {
    return this.users;
  }

  loadUsers = async () => {
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

    if (this.selectedStatus !== "all") {
      params.set("status", this.selectedStatus);
    }

    const response = await GET<UsersListResponse>(
      `${endpoints.admin.users.list}?${params.toString()}`,
    );

    runInAction(() => {
      if (response.ok) {
        this.users = response.data.data;
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

  setSelectedStatus = (status: UserStatusFilter) => {
    this.selectedStatus = status;
    this.page = 1;
  };

  setSortBy = (sortBy: UserSortOption) => {
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

  selectUser = (user: User) => {
    this.selectedUser = user;
  };

  clearSelectedUser = () => {
    this.selectedUser = null;
  };

  resetFilters = () => {
    this.query = "";
    this.selectedStatus = "all";
    this.sortBy = "name";
    this.sortDirection = "asc";
    this.page = 1;
  };
}

export const usersStore = new UsersStore();
