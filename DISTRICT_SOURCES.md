# District screen data and verification

Reviewed 31 October 2026.

- District directory: https://igod.gov.in/sg/CG/E042/organizations lists 33 districts. Existing district names, headquarters and SVG IDs are retained.
- Regional agriculture: ICAR-IGFRI, *Fodder Resources Development Plan for Chhattisgarh* (2024), Table 1 (PDF page 20) and Table 5 (PDF pages 30–31): https://igfri.org.in/uploads/Fodder%20Plan%20-Chhattisgarh.pdf. Annual rainfall ranges, soil descriptions and crop examples are regional references, not measured district statistics or farm recommendations.
- Regional coverage: https://igkv.ac.in/smartkisan/eKnowledge/Home.aspx. Browse groups use legacy regional coverage and parent districts; they are not a new official agro-climatic boundary dataset. Kanker and Raigarh appear in both relevant groups. Current administrative boundaries do not coincide exactly with agricultural zones.
- Forecast locations: `src/data/districtPlaces.json` contains Open-Meteo/GeoNames results with source IDs, filtered to Chhattisgarh, India. Alternate spellings resolved Dantewada and Rajnandgaon. Mohla's fuzzy match incorrectly identified Mohlai; it was rejected. Its forecast instead explicitly names Ambagarh Chauki, a verified town in Mohla-Manpur-Ambagarh Chouki district. Forecasts are for the displayed point, not district-wide averages.
- Weather: https://open-meteo.com/en/docs. Three-day forecasts and modelled current conditions use Asia/Kolkata time; the screen displays provider and observation/model time. Humidity is air humidity, not measured soil moisture. Cached for ten minutes in memory; refresh bypasses the cache. Missing values and failed requests are not replaced with fabricated values.
- Advisory: https://mausam.imd.gov.in/responsive/agromet_adv_ser_district_level_wx_forecast.php opens IMD's district bulletin service. No generated advice is presented as an IMD bulletin.

The previous unreferenced crop/produce and district narrative fields remain in the original JSON for compatibility but are not presented as verified district facts on the redesigned screen. No fabricated mandi prices, annual district rainfall or live soil readings were added.

## Checks

- `npm test`: map/data coverage for all 33 districts, regional overlap/search, forecast validation, request coalescing/cache/refresh and failure recovery, plus existing HTTP tests.
- `npm run lint` and `npm run typecheck`.
- Browser checks at 320, 390 and 768 pixels: all district selections, Hindi search, region filters, map/zoom, language persistence, speech control wiring, weather failure/retry. Network failure and speech lifecycle checks use controlled mocks. A separate live Raipur forecast loaded successfully.
- Android development bundle compiled with the installed Hermes compiler.
- Physical-device frame rate, native SVG touches and device voices still require Expo Go testing. Browser checks do not prove native smoothness.
