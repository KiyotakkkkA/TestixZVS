const ACCESS_TOKEN_KEY = "zvs.access_token";
const TOKEN_EXPIRES_AT_KEY = "zvs.token_expires_at";
const TOKEN_STORAGE_KEY = "zvs.token_storage";

export type TokenStorageType = "local" | "session";

export type StoredToken = {
  token: string;
  expiresAt: string;
  storageType: TokenStorageType;
};

function getStorage(storageType: TokenStorageType) {
  if (typeof window === "undefined") {
    return null;
  }

  return storageType === "local" ? window.localStorage : window.sessionStorage;
}

function getStoredStorageType(): TokenStorageType {
  if (typeof window === "undefined") {
    return "session";
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) === "local"
    ? "local"
    : "session";
}

export function getStoredToken(): StoredToken | null {
  const storageType = getStoredStorageType();
  const storage = getStorage(storageType);
  const token = storage?.getItem(ACCESS_TOKEN_KEY);
  const expiresAt = storage?.getItem(TOKEN_EXPIRES_AT_KEY);

  if (!token || !expiresAt) {
    return null;
  }

  if (new Date(expiresAt).getTime() <= Date.now()) {
    clearStoredToken();
    return null;
  }

  return { token, expiresAt, storageType };
}

export function setStoredToken({
  token,
  expiresAt,
  storageType,
}: StoredToken) {
  clearStoredToken();

  const storage = getStorage(storageType);
  storage?.setItem(ACCESS_TOKEN_KEY, token);
  storage?.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, storageType);
  }
}

export function clearStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
