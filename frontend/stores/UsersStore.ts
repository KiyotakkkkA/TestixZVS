import { makeAutoObservable } from "mobx";

export type AdminUserStatus = "active" | "pending" | "blocked";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: AdminUserStatus;
};

export type UserStatusFilter = AdminUserStatus | "all";
export type UserSortOption = "name" | "status" | "role";
export type UserSortDirection = "asc" | "desc";

type UserComparator = (firstUser: AdminUser, secondUser: AdminUser) => number;

const statusOrder: Record<AdminUserStatus, number> = {
  active: 1,
  pending: 2,
  blocked: 3,
};

const userComparators: Record<UserSortOption, UserComparator> = {
  name: (firstUser, secondUser) =>
    firstUser.name.localeCompare(secondUser.name, "ru"),
  status: (firstUser, secondUser) =>
    statusOrder[firstUser.status] - statusOrder[secondUser.status],
  role: (firstUser, secondUser) =>
    firstUser.role.localeCompare(secondUser.role, "ru"),
};

const usersSeed: AdminUser[] = [
  {
    id: 1,
    name: "Алексей Морозов",
    email: "alexey@example.com",
    role: "admin",
    status: "active",
  },
  {
    id: 2,
    name: "Мария Соколова",
    email: "maria@example.com",
    role: "editor",
    status: "active",
  },
  {
    id: 3,
    name: "Иван Петров",
    email: "ivan@example.com",
    role: "user",
    status: "pending",
  },
  {
    id: 4,
    name: "Ольга Андреева",
    email: "olga@example.com",
    role: "user",
    status: "blocked",
  },
];

export class UsersStore {
  users = usersSeed;
  query = "";
  selectedStatus: UserStatusFilter = "all";
  sortBy: UserSortOption = "name";
  sortDirection: UserSortDirection = "asc";
  selectedUser: AdminUser | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get filteredUsers() {
    const normalizedQuery = this.query.trim().toLowerCase();

    return this.users
      .filter((user) => {
        const matchesQuery =
          !normalizedQuery || user.name.toLowerCase().includes(normalizedQuery);
        const matchesStatus =
          this.selectedStatus === "all" || user.status === this.selectedStatus;

        return matchesQuery && matchesStatus;
      })
      .sort((firstUser, secondUser) => {
        const sortOrder = this.sortDirection === "asc" ? 1 : -1;

        return userComparators[this.sortBy](firstUser, secondUser) * sortOrder;
      });
  }

  setQuery = (query: string) => {
    this.query = query;
  };

  setSelectedStatus = (status: UserStatusFilter) => {
    this.selectedStatus = status;
  };

  setSortBy = (sortBy: UserSortOption) => {
    this.sortBy = sortBy;
  };

  toggleSortDirection = () => {
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
  };

  selectUser = (user: AdminUser) => {
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
  };
}

export const usersStore = new UsersStore();
