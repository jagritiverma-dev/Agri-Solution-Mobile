# Farmer-friendly app update

- Bottom navigation: Home, Crops, Weather, Profile, Settings. Settings sits immediately after Profile and uses a gear icon.
- Settings uses the existing persisted English/Hindi preference. It also provides a short guide to the main services.
- Bundled translations cover navigation, forms, Crop Doctor, crop descriptions, varieties, growing details, scheme benefits, eligibility, documents, application methods and all district forecast location names.
- Scheme summaries use simpler English. Hindi no longer displays a second English scheme or crop name underneath the selected-language title.
- Home services and crop categories have different background colors. District weather uses blue, agriculture green, soil amber and reference information purple. The map uses a varied district palette and retains a distinct selected state.
- Larger supporting text, wrapping crop titles, larger district controls and wrapping forecast cards improve readability.
- Removed links to the absent token route and the empty duplicate Crop Doctor route.

## Validation

- 14 automated tests pass, including translation coverage for bundled crop details, all 25 schemes and all 33 district forecast locations.
- TypeScript, Expo lint and web export are used to validate the changes. The web export is in `dist-review/`.
- No native Android/iOS build or physical-device visual test was performed.

## Content boundaries

Live notices, procurement directory entries and the older server-provided crop-detail route still use the server's translation dictionary. New or untranslated server content retains its original wording; the app does not invent translations. User-entered names and conversation history are preserved. Future assistant replies request the selected language through the existing API.

## Device review

1. Switch English → Hindi → English from Settings and a page header. Check crops, expanded schemes, weather, district details, forms and Crop Doctor.
2. Restart the app and confirm the selected language is restored.
3. Check small screens and a larger system font size; scroll to the end of each page.
4. Check Hindi and English speech, map touches, keyboard behavior and screen-reader labels on Android/iOS.
