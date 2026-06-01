import { makeAutoObservable, runInAction } from "mobx";
import { GET } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  type TokenStorageType,
} from "@/services/tokenStorage";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  status: string;
  roles: string[];
  permissions: string[];
};

export type LoginResponse = {
  token: string;
  tokenType: "Bearer";
  expiresAt: string;
  user: AuthUser;
};

export class AuthStore {
  token: string | null = null;
  tokenExpiresAt: string | null = null;
  user: AuthUser | null = null;
  isBootstrapped = false;
  isBootstrapping = false;

  constructor() {
    makeAutoObservable(this);
  }

  get isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  bootstrap = async () => {
    if (this.isBootstrapped || this.isBootstrapping) {
      return;
    }

    this.isBootstrapping = true;

    const storedToken = getStoredToken();

    if (!storedToken) {
      this.isBootstrapped = true;
      this.isBootstrapping = false;
      return;
    }

    this.token = storedToken.token;
    this.tokenExpiresAt = storedToken.expiresAt;

    try {
      const response = await GET<AuthUser>(endpoints.auth.me);

      runInAction(() => {
        if (response.ok) {
          this.user = response.data;
        } else {
          this.clearAuth();
        }

        this.isBootstrapped = true;
        this.isBootstrapping = false;
      });
    } catch {
      runInAction(() => {
        this.clearAuth();
        this.isBootstrapped = true;
        this.isBootstrapping = false;
      });
    }
  };

  login = (session: LoginResponse, storageType: TokenStorageType) => {
    setStoredToken({
      token: session.token,
      expiresAt: session.expiresAt,
      storageType,
    });

    this.token = session.token;
    this.tokenExpiresAt = session.expiresAt;
    this.user = session.user;
  };

  logout = () => {
    this.clearAuth();
  };

  clearAuth = () => {
    clearStoredToken();
    this.token = null;
    this.tokenExpiresAt = null;
    this.user = null;
  };

  isUserInRole = (role: string) => {
    return this.user?.roles.includes(role) ?? false;
  };

  isUserHasPermission = (permission: string) => {
    return this.user?.permissions.includes(permission) ?? false;
  };
}

export const authStore = new AuthStore();
