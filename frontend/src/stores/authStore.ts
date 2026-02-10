import { makeAutoObservable, runInAction } from "mobx";

import { AuthStorage } from "../services/authStorage";
import {
    AuthService,
    LoginPayload,
    RegisterPayload,
    VerifyPayload,
} from "../services/auth";

import type { User, UserPermission, UserRole } from "../types/User";

export class AuthStore {
    user: User | null = AuthStorage.getUser();
    token: string | null = AuthStorage.getToken();
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get isAuthorized(): boolean {
        return Boolean(this.token);
    }

    private setSession(user: User, token: string): void {
        this.user = user;
        this.token = token;
        AuthStorage.setUser(user);
        AuthStorage.setToken(token);
    }

    private clearSession(): void {
        this.user = null;
        this.token = null;
        this.error = null;
        AuthStorage.clear();
    }

    hasRoles(roles: UserRole[]): boolean {
        return roles.every((role) => this.user?.roles.includes(role)) ?? false;
    }

    hasPermissions(permissions: UserPermission[]): boolean {
        return (
            permissions.every((permission) =>
                this.user?.perms.includes(permission),
            ) ?? false
        );
    }

    async init(): Promise<void> {
        if (!this.token) return;
        try {
            this.isLoading = true;
            const data = await AuthService.me();
            runInAction(() => {
                this.user = data.user;
                AuthStorage.setUser(data.user);
            });
        } catch {
            runInAction(() => {
                this.clearSession();
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async login(creds: LoginPayload): Promise<boolean> {
        try {
            this.isLoading = true;
            this.error = null;
            const data = await AuthService.login(creds);
            runInAction(() => {
                this.setSession(data.user, data.token);
            });
            return true;
        } catch (error: any) {
            runInAction(() => {
                this.error =
                    error?.response?.data?.message || "Ошибка авторизации";
            });
            return false;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async register(creds: RegisterPayload): Promise<string | false> {
        try {
            this.isLoading = true;
            this.error = null;
            const data = await AuthService.register(creds);
            runInAction(() => {
                this.user = data.user;
                AuthStorage.setUser(data.user);
            });
            return data.verify_token;
        } catch (error: any) {
            runInAction(() => {
                console.log(error);
                this.error =
                    error?.response?.data?.message || "Ошибка регистрации";
            });
            return false;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async verifyEmail(payload: VerifyPayload): Promise<boolean> {
        try {
            this.isLoading = true;
            this.error = null;
            const data = await AuthService.verify(payload);
            runInAction(() => {
                this.setSession(data.user, data.token);
            });
            return true;
        } catch (error: any) {
            runInAction(() => {
                this.error =
                    error?.response?.data?.message || "Ошибка подтверждения";
            });
            return false;
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async logout(): Promise<void> {
        try {
            await AuthService.logout();
        } finally {
            runInAction(() => {
                this.clearSession();
            });
        }
    }
}

export const authStore = new AuthStore();
