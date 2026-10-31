# Verification report — 26 October 2026

## Completed and tested

| Check | Result |
| --- | --- |
| Node / npm | v24.19.0 / 11.17.0 |
| Configured MongoDB connectivity | Read-only ping passed |
| Backend tests | 5/5 passed, including real MongoDB integration in isolated temporary collections |
| Mobile HTTP-client tests | 5/5 passed |
| TypeScript | `npm run typecheck` passed |
| Lint | `npm run lint` passed after fixes |
| Expo Doctor | 20/20 checks passed |
| Android and iOS JS/Hermes export | Both passed; output is `mobile/dist-native/` |
| Expo native configuration introspection | Passed; local-testing HTTP enabled explicitly, blocked permissions marked for removal |
| Root website startup | `npm start` started successfully on an ephemeral localhost port |
| Existing website routes | HTML pages, EJS list/detail pages and assets returned HTTP 200 |
| Private file protection | Private configuration/source paths returned HTTP 403; encoded Windows traversal blocked |
| Browser UI preview | Passed at 390 × 844: home, crop search and growing details, scheme search and eligibility details, district map selection/list, login validation; no page exceptions |
| Live weather | Open-Meteo returned HTTP 200 and a numeric temperature |

Backend integration covered legacy and versioned registration/login, duplicate registration, wrong passwords, authenticated profile, hashed session storage, expiry, logout, password change with session revocation, token quantity validation, concurrent number allocation, retry deduplication, idempotency conflicts and owner-only history. Tests used the configured MongoDB through uniquely prefixed `mobile_test_<random>_` collections. Only those test collections were removed. Production users and token collections were untouched by tests.

Browser tests used Chrome through Playwright and proxied the app's configured LAN URL to a dedicated local server. They validate the React Native Web preview, **not native Android/iOS behavior**. Screenshots are in `artifacts/home.png`, `artifacts/schemes.png`, and `artifacts/districts.png`.

## APK and iOS build status

**No APK or IPA was produced.** Native binaries, signing, installation and device behavior have not been verified.

Java/JDK, Android SDK, adb and Gradle were not present on PATH or in the standard checked installation directories. Native iOS compilation is unavailable on Windows.

Executed from `mobile/`:

```text
npx eas-cli@latest whoami
Not logged in

npx eas-cli@latest build --platform android --profile preview-lan --non-interactive
An Expo user account is required to proceed.
Either log in with eas login or set the EXPO_TOKEN environment variable ...
Error: build command failed.
```

The user confirmed the portal is not publicly hosted. Local Wi-Fi testing is configured, and the README explains EAS login/project initialization, setting the cloud build's LAN address, APK download/install and later HTTPS deployment. No signing credentials, Expo account or project ID were fabricated. The user must complete Expo login to continue a cloud build.

## Remaining issues and limits

- The existing `scripts/test-hindi.cjs` suite was attempted using system Chrome. It failed on `index.html` before the mobile workflows, reporting untranslated `Search this page`, `Open search`, and a mixed-language `current weather` label. This is not a passing full-site Hindi regression run. The suite also has older browser-only authentication/token assumptions and archived page paths that need a separate update. New password/token labels were added to the Hindi dictionary; mobile copy without an exact reviewed translation remains English.
- `npm audit` in mobile reports **five high-severity findings**, associated with Expo CLI/tooling through `node-forge` and `zod` (including parent-package findings). Automatic `--force` remediation proposes a major Expo downgrade; that was not applied. Review compatible upstream fixes before public release. Root/backend dependency audit reported zero vulnerabilities.
- Gemini/iFlytek provider calls were not exercised end to end. The farming-assistant UI uses the existing server endpoint; missing credentials, provider outages and rate limits are shown as errors. Native microphone dictation was not added; OS keyboard dictation and device text-to-speech are the available alternatives.
- Device location prompts, SecureStore behavior, native SVG touch interaction, screen readers, Hindi voice availability, sharing sheets, splash/icon rendering, Android back navigation and iOS keyboard/safe-area behavior still need device testing.
- No password-recovery or profile-edit service exists; none is simulated. There is no live verified procurement/market-price API. Procurement placeholders are excluded and demonstration data is identified.
- Earlier browser-local produce tokens are retained in browser storage but not imported into MongoDB. Existing browser sessions without new server tokens must log in again. The portal's token records are not official procurement authorizations.
- Some source image paths are absent; the app uses existing crop imagery or bundled portal artwork as a fallback. Notice export is native text sharing; the website retains PDF summaries.
- Same-Wi-Fi builds depend on the computer remaining available at the embedded LAN address. A public production build needs an HTTPS backend. Do not distribute HTTP-enabled LAN builds as production.

## Repeat checks

See README for the exact commands and prerequisites. `scripts/test-mobile-ui.cjs` expects a running Expo web preview and a backend (`MOBILE_PREVIEW_URL`, `AGRI_TEST_URL`). The test currently rewrites the initial LAN address `10.110.128.57:3000`; update that route if changing the development address. Test output does not log passwords or session tokens.

Android/iOS export evidence:

```text
Android Bundled ... node_modules/expo-router/entry.js
iOS Bundled ... node_modules/expo-router/entry.js
Exported: dist-native
```

These Hermes bundles are not installable APKs. Build completion must be verified separately in EAS before an APK path can be supplied.
