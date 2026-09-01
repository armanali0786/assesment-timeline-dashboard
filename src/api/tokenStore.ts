const STORAGE_KEY = "timeline_dashboard_token";

export const tokenStore = {
  get(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
  },
  set(token: string): void {
    sessionStorage.setItem(STORAGE_KEY, token);
  },
  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
};

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

export function emitUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener());
}
