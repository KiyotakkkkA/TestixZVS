export type UserStatus = "active" | "confirmation_pending" | "suspended";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  status: UserStatus;
};
