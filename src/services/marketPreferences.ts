import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { PriceAlertPreference } from "../types/market";
import { validPreference } from "../utils/marketPreference";

const STORAGE_KEY = "mor_kisani_market_preference_v1";
export async function readMarketPreference(): Promise<PriceAlertPreference | null> {
  const raw = Platform.OS === "web" ? globalThis.localStorage.getItem(STORAGE_KEY) : await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!validPreference(value)) throw new Error("Invalid saved market preference");
  return value;
}
export async function saveMarketPreference(value: PriceAlertPreference): Promise<void> {
  if (!validPreference(value)) throw new Error("Invalid market preference");
  const raw = JSON.stringify(value);
  if (Platform.OS === "web") globalThis.localStorage.setItem(STORAGE_KEY, raw);
  else await SecureStore.setItemAsync(STORAGE_KEY, raw);
}
