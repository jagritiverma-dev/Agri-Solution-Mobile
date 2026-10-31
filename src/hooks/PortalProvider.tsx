import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { api, onUnauthorized, restoreToken, saveToken } from "../services/api";
import { Content, LoginResponse, User } from "../types";
import { translate, type Language } from "../config/localization";
import { useResource } from "./useResource";
const loadContent = () => api<Content>("content");
const LANGUAGE_STORAGE_KEY = "mor_kisani_language";
async function saveLanguagePreference(language: Language) {
  if (Platform.OS === "web") {
    globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } else {
    await SecureStore.setItemAsync(LANGUAGE_STORAGE_KEY, language);
  }
}

function usePortalState() {
  const [contentRequested, setContentRequested] = useState(false);
  const content = useResource(loadContent, contentRequested);
  const ensureContent = useCallback(() => setContentRequested(true), []);
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [language, setLanguageState] = useState<Language>("en");
  const [languageReady, setLanguageReady] = useState(false);
  const [languageError, setLanguageError] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreLanguage() {
      try {
        const savedLanguage =
          Platform.OS === "web"
            ? globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)
            : await SecureStore.getItemAsync(LANGUAGE_STORAGE_KEY);
        if (active && (savedLanguage === "en" || savedLanguage === "hi")) {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error(
          "Unable to restore the saved language preference.",
          error,
        );
        if (active) setLanguageError(true);
      } finally {
        if (active) setLanguageReady(true);
      }
    }

    void restoreLanguage();
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    setLanguageError(false);
    void saveLanguagePreference(nextLanguage).catch((error: unknown) => {
      console.error("Unable to save the language preference.", error);
      setLanguageError(true);
    });
  }, []);

  async function refreshUser() {
    const result = await api<User>("me", undefined, true);
    setUser(result);
  }
  useEffect(() => {
    onUnauthorized(() => setUser(null));
    (async () => {
      try {
        if (await restoreToken()) await refreshUser();
      } catch (error) {
        setSessionError(
          error instanceof Error ? error.message : "Unable to restore session.",
        );
      } finally {
        setRestoring(false);
      }
    })();
  }, []);
  async function login(mobile: string, password: string) {
    const result = await api<LoginResponse>("auth/login", {
      mobile: mobile.trim(),
      password,
    });
    await saveToken(result.accessToken);
    setUser(result);
    setSessionError("");
  }
  async function logout() {
    // Keep the session available for retry if server revocation fails.
    await api("logout", {}, true);
    await saveToken(null);
    setUser(null);
  }
  const t = useCallback((text: string) =>
    translate(text, language) ??
    (language === "hi" ? content.data?.translations[text] || text : text),
    [language, content.data?.translations]);
  return {
    content,
    ensureContent,
    user,
    restoring,
    sessionError,
    language,
    setLanguage,
    languageReady,
    languageError,
    t,
    login,
    logout,
    refreshUser,
    clearSession: async () => {
      await saveToken(null);
      setUser(null);
    },
  };
}
const Context = createContext<ReturnType<typeof usePortalState> | null>(null);
export function PortalProvider({ children }: React.PropsWithChildren) {
  return (
    <Context.Provider value={usePortalState()}>{children}</Context.Provider>
  );
}
export function usePortal() {
  const value = useContext(Context);
  if (!value) throw new Error("Portal provider missing");
  return value;
}
