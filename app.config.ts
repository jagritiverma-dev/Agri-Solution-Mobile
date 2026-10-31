import type { ExpoConfig } from "expo/config";
const localTesting = process.env.EXPO_PUBLIC_ALLOW_HTTP === "true";
if (
  process.env.EAS_BUILD_PROFILE === "production" &&
  (localTesting || !process.env.EXPO_PUBLIC_API_URL?.startsWith("https://"))
)
  throw new Error(
    "Production requires EXPO_PUBLIC_API_URL=https://... and HTTP testing disabled.",
  );
const config: ExpoConfig = {
  name: "Agri-Solution",
  slug: "agri-solution-mobile",
  version: "1.0.0",
  scheme: "agrisolution",
  orientation: "default",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  ios: {
    bundleIdentifier: "com.agrisolution.portal",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      ...(localTesting
        ? {
            NSAppTransportSecurity: {
              NSAllowsLocalNetworking: true,
              NSAllowsArbitraryLoads: true,
            },
          }
        : {}),
    },
  },
  android: {
    package: "com.agrisolution.portal",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
    blockedPermissions: [
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.VIBRATE",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/icon.png",
        imageWidth: 160,
        backgroundColor: "#eaf3eb",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Show weather for your current location when you request it.",
      },
    ],
    [
      "expo-build-properties",
      { android: { usesCleartextTraffic: localTesting } },
    ],
  ],
 extra: {
  eas: {
    projectId: "c24dec78-5696-4a19-b504-9631034f897e",
  },
},
};
export default config;
