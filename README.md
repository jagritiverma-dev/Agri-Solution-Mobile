# Agri-Solution mobile

Native Android/iOS application for the existing portal. Expo SDK 58, React Native 0.88, React 19.3, TypeScript, Expo Router. This is a separate npm project under `mobile/`; the original website is still Node/Express/EJS.

## Run on your Wi-Fi (no public hosting required)

From the repository root, in PowerShell:

```powershell
npm install
$env:HOST='0.0.0.0'
$env:PORT='3000'
npm start
```

Leave that terminal open. MongoDB and provider secrets stay in `backend/.env`. In another terminal:

```powershell
cd mobile
npm ci
# Copy .env.example to .env.local if no local configuration exists.
# Set EXPO_PUBLIC_API_URL=http://YOUR_PC_WIFI_IP:3000
# Set EXPO_PUBLIC_ALLOW_HTTP=true for local testing only.
npm start
```

This machine's Wi-Fi address during implementation was `10.110.128.57`. An ignored `.env.local` is configured with `http://10.110.128.57:3000`. Update it if the IP changes. Both devices must be on a network allowing peer connections; allow Node through Windows Firewall on your private network if prompted. Open `http://YOUR_PC_WIFI_IP:3000` on the phone first. Never use `localhost` for the computer from a physical phone. The API URL is the portal origin, **without `/api`**. Android emulator host access normally uses `10.0.2.2` instead.

Use an Expo client compatible with SDK 58, or an EAS-built app. Run `npm run android` / `npm run ios` to open an available client. Native iOS compilation requires macOS/Xcode or EAS. A development server alone does not produce an APK.

## Build an installable Android APK

No APK was produced in this session: Java/Android SDK/Gradle were unavailable, and EAS reported that no Expo account was logged in.

From `mobile/`:

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

Because configuration is dynamic, set the real project ID returned by EAS in the `EAS_PROJECT_ID` environment variable (or add it to `extra.eas.projectId` in `app.config.ts`). Never invent an ID. Configure the cloud build's public URL (not a secret):

```powershell
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --value http://YOUR_PC_WIFI_IP:3000 --visibility plaintext
npx eas-cli@latest build --platform android --profile preview-lan
```

`preview-lan` creates a signed, standalone **APK** with explicitly enabled HTTP for local testing. Keep the portal running on the same Wi-Fi while using it. It does not require Metro once installed. The address is embedded at build time, so rebuild if it changes. Do not distribute LAN builds as production releases. The public API address is not a credential; it is visible in the app.

After hosting the same backend over HTTPS, set the preview environment URL to that HTTPS origin and run:

```powershell
npx eas-cli@latest build --platform android --profile preview
```

Download the APK from the EAS build's artifact URL after a successful build. Install on your phone by opening the downloaded APK and allowing installation from that source, or run `adb install -r path\to\downloaded.apk`. No APK path can be reported until a build succeeds. EAS prompts to create/manage Android signing credentials; keep the keystore and passwords in EAS credentials storage or a secure vault, never Git. Retain the same signing key for updates. `production` builds an AAB for Google Play and rejects HTTP/missing HTTPS configuration.

The package/bundle ID is `com.agrisolution.portal`. Confirm ownership/availability before a store release. There is no Expo account owner or fabricated EAS project ID in source.

If you install JDK and Android SDK locally later, `npx expo run:android` generates native projects through Expo and builds a development APK. For a standalone local test APK, set the API variables first, then `npx expo prebuild --platform android`, followed by `android\gradlew.bat -p android assembleRelease`. Generated release signing must be inspected/configured before distributing; never treat a debug-key-signed APK as a production release. The supported primary workflow here is EAS.

## iOS

```powershell
npx eas-cli@latest build --platform ios --profile ios-simulator
# For a registered physical iPhone, with Apple Developer provisioning:
npx eas-cli@latest build --platform ios --profile preview
```

Use `preview-lan` for an explicitly local HTTP iPhone test build. Physical-device distribution requires Apple Developer access, signing/provisioning and device registration. Simulator builds run on macOS. Windows can develop the shared TypeScript and request cloud builds, but cannot run Xcode or the iOS Simulator. Test location denial, keyboard behavior, Hindi voices, navigation and secure storage on real devices before release.

## Features and data

- Native home navigation, registration/login, refreshed profile, password change, logout.
- SecureStore stores only the opaque session token, never passwords. Tokens expire after seven days and are hashed in MongoDB; password changes revoke all sessions. Restore fetches `/me` rather than trusting a saved profile.
- Searchable/filterable crop guides with seed, irrigation, soil, fertilizer, crop protection, varieties and existing acreage figures; full scheme eligibility/benefit/document sections and official application links.
- Interactive native SVG district map and searchable district details, using the existing artwork/data.
- Weather for six existing cities or optional foreground location; seven-day forecast, modelled soil moisture/temperature and regional soil profiles. Location is sent only to Open-Meteo when requested. No background tracking.
- Procurement selectors exclude PHP/SQL placeholder areas and identify demonstration data. No fabricated live prices.
- Notices with official links, text sharing and device text-to-speech; farming assistant uses the existing Gemini endpoint with English/Hindi support.
- Shared MongoDB produce tokens, atomic daily sequence allocation, owner-scoped history, idempotent retries and native sharing. Website now reads/writes the same records. Sequence gaps are possible when simultaneous retries allocate a number before deduplication; numbers remain unique.
- Existing Hindi dictionary reused where exact reviewed translations exist; unmatched/new copy stays English. Device speech voices depend on OS availability.
- Pull-to-refresh, retry/error/empty states, accessible buttons, safe areas and keyboard-aware forms.

There is no password-recovery, verified procurement/market feed, profile-edit, upload or push-notification service in the source. No such production capability is claimed. Older localStorage-only website tokens remain on their original browser and are not imported. Notices and scheme details are editorial website content, not a new live government feed. Missing source images show bundled portal artwork. Mobile notice export uses native text sharing; the website's PDF summary feature remains on the website. Native speech recognition is not implemented; device keyboard dictation can enter assistant questions, and device TTS reads answers.

## Backend endpoints

Existing registration and login remain at `POST /api/register`, `/api/login` and `/api/v1/auth/register`, `/api/v1/auth/login`. Login adds `accessToken` and `expiresAt` while retaining previous response fields. Existing chatbot: `POST /api/v1/chatbot/message`. Existing speech routes remain unchanged.

New public routes: `GET /api/v1/content`, `GET /api/v1/district-map`. Content comes from the existing crop model, HTML, JS dictionaries and SVG, not a separate catalogue/database.

New authenticated routes: `GET /api/v1/me`, `POST /api/v1/logout`, `POST /api/v1/password`, `GET /api/v1/tokens`, `POST /api/v1/tokens`. Send `Authorization: Bearer <accessToken>`. Token creation accepts numeric `landArea`, `quantity`, and a random `requestId`. Validation and ownership are enforced on the server.

MongoDB uses the existing database with additive `sessions`, `produceTokens`, `tokenCounters` collections. A TTL index expires sessions; expiry is also checked in requests. No production records or database were replaced. Newly shared tokens require re-login for browser sessions created before this change. Static serving now blocks private source/configuration paths. Authentication is rate limited per process; deployments with multiple instances should use a shared edge limiter.

## Verification

```powershell
# Repository root: tests against real MongoDB using isolated temporary collections
$env:MOBILE_DB_TEST='1'
node --test scripts/test-mobile-backend.cjs
# Without MOBILE_DB_TEST=1, only non-database tests run.

cd mobile
npm run typecheck
npm run lint
npm test
npx expo-doctor
npx expo export --platform android --platform ios --output-dir dist-native
```

Integration tests use a random `mobile_test_<id>_` collection prefix in the configured database, and remove only those collections afterward. Production user/token collections are untouched. See `VERIFICATION.md` for results and remaining manual checks. JavaScript exports under `dist-native/` are not APK/IPA binaries.

Reference: [Expo APK builds](https://docs.expo.dev/build-reference/apk/), [SDK 58](https://docs.expo.dev/versions/v58.0.0/), [SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/).
