import { makeAutoObservable, runInAction } from "mobx";
import { GET, POST } from "@/services/api";
import { endpoints } from "@/services/endpoints";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/services/tokenStorage";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  status: string;
};

type LoginRequest = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type LoginResponse = {
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
  isLoading = false;

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

  login = async (credentials: LoginRequest) => {
    this.isLoading = true;

    const response = await POST<LoginResponse>(
      endpoints.auth.login,
      credentials,
    );

    runInAction(() => {
      this.isLoading = false;

      if (response.ok) {
        const storageType = credentials.rememberMe ? "local" : "session";

        setStoredToken({
          token: response.data.token,
          expiresAt: response.data.expiresAt,
          storageType,
        });

        this.token = response.data.token;
        this.tokenExpiresAt = response.data.expiresAt;
        this.user = response.data.user;
      }
    });

    return response;
  };

  logout = async () => {
    this.isLoading = true;
    await POST(endpoints.auth.logout);

    runInAction(() => {
      this.isLoading = false;
      this.clearAuth();
    });
  };

  clearAuth = () => {
    clearStoredToken();
    this.token = null;
    this.tokenExpiresAt = null;
    this.user = null;
  };
}

export const authStore = new AuthStore();
