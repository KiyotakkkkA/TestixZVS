export type UserStatus = "active" | "confirmation_pending" | "suspended";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
};
