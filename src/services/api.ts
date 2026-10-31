import * as SecureStore from "expo-secure-store";
import { fetchJson, validateBaseUrl } from "./http";

function baseUrl(): string {
  return validateBaseUrl(
    process.env.EXPO_PUBLIC_API_URL || "",
    __DEV__,
  );
}

let unauthorizedHandler: (() => void) | undefined;

export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

export async function restoreToken(): Promise<boolean> {
  const token = await SecureStore.getItemAsync("agri_access_token");
  return Boolean(token);
}

export async function saveToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync("agri_access_token", token);
  } else {
    await SecureStore.deleteItemAsync("agri_access_token");
  }
}

export async function api<T = { success: boolean }>(
  endpoint: string,
  body?: unknown,
  authenticated = false,
): Promise<T> {
  const token = authenticated
    ? await SecureStore.getItemAsync("agri_access_token")
    : null;

  try {
    return await fetchJson<T>(
      `${baseUrl()}/api/mobile/${endpoint.replace(/^\/+/, "")}`,
      {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Accept: "application/json",
          ...(body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined
          ? {}
          : { body: JSON.stringify(body) }),
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      error.status === 401
    ) {
      unauthorizedHandler?.();
    }

    throw error;
  }
}



export function assetUrl(path?: string | null): string {
  if (!path) return "";

  // Already a complete remote URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiBase = process.env.EXPO_PUBLIC_API_URL;

  if (!apiBase) {
    return "";
  }

  // Remove the API route prefix to get the server origin.
  const origin = apiBase
    .replace(/\/api(?:\/.*)?\/?$/, "")
    .replace(/\/$/, "");

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${origin}${normalizedPath}`;
}

