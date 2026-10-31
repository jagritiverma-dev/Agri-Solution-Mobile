# Agricultural Market: local data and maintenance

## Market UI refresh — 1 November 2026

The page is now titled **Market Information / मंडी एवं बाजार भाव**. It groups crop prices, farm purchases, dealers/support and sale planning, with a prominent offline calculator. It reuses the existing green, amber, blue and purple card styles. Dealer categories are directly selectable; reported modal prices and net sale amounts are visually highlighted. Both languages use the same layout.

The latest supplied specification is preserved verbatim in `docs/market-supplied-specification.txt` for review, not imported by the app. Its MSP/state-support figures map to `msp.ts`; dated mandi observations to `mandiPrices.ts`; input-price claims to `inputPrices.ts`; shops to `dealers.ts`; PACS/KVK facilities to `centres.ts`. These claims still need supporting records, effective dates and verification before publication. Do not treat the supplied ₹3,100 procurement claim as a universally applicable comparison rate, or label DAP/MOP/NPK claims as statutory ceilings without supporting notifications. The requested closing-auction push-notification statement is not displayed because no notification service is connected.

Pre-refresh backups are in `.backups/market-ui-20261101/`. This refresh modifies `src/app/market/{index,dealers,mandi}.tsx`, `src/components/market/{MarketUI,SaleForm}.tsx`, `src/config/marketTranslations.ts`, `scripts/review-market-ui.cjs`, and this guide. The archived specification is the only new file.

The frontend uses manually maintained TypeScript data. It does not call market APIs, scrape websites, or use the existing backend directory as verified market data. All five production datasets initially contain **no records**.

## Where to add data

| Information | Local module | Required content |
| --- | --- | --- |
| Government MSP | `src/data/market/msp.ts` | Crop ID, grade ID and bilingual grade, marketing season ID and label, rupees per quintal, applicable date, official source, reporting date, verification |
| Mandi rates | `src/data/market/mandiPrices.ts` | District ID, mandi ID and bilingual name, crop and grade, minimum/maximum/modal rupees per quintal, reporting date, official source, verification |
| Dealers | `src/data/market/dealers.ts` | Bilingual name, district ID, categories, available products, source and verification; optional address, telephone, coordinates, licence and hours |
| Input prices | `src/data/market/inputPrices.ts` | Bilingual product, formulation and package size; price, `regulated` / `mrp` / `quotation`, effective date, source and verification |
| Government centres | `src/data/market/centres.ts` | Name, district, `procurement` / `support` / `soil-lab` / `training`, source and verification; available contacts and separately supported operational status |
| Material awaiting review | `src/data/market/review.ts` | Document title, page/section, notes and partial candidate records. Never imported into farmer-facing screens. |
| Crop selection labels | `src/data/market/catalogue.ts` | Stable crop IDs and Hindi/English names. These labels do not imply prices or procurement eligibility. |

Types are defined in `src/types/market.ts`. Use `MarketText` objects with both `hi` and `en` for every display name, grade, address and descriptive field. District IDs come from the existing `src/data/districts.ts`; for example, use its actual ID rather than inventing a new spelling of the district name.

## Import and verification workflow

1. Transcribe a supplied claim into the relevant `reviewData` array. Keep the document title and page reference.
2. Find its supporting record manually. Record the actual source name, HTTPS URL or document reference, reporting date and the applicable date where relevant. Nothing is downloaded automatically.
3. Confirm the crop, grade, unit, season and amount. Use the **same `gradeId`** only when the MSP and mandi records refer to the same grade. Prices in these two datasets use `unit: "INR/quintal"` exclusively; convert other units only after checking the source.
4. Add the complete typed record to the corresponding production module. Set `verification.status: "verified"` and `checkedOn: "YYYY-MM-DD"` only after checking evidence. A flag is not evidence by itself.
5. Run `npm.cmd run typecheck`, `npm.cmd run lint` and `npm.cmd test`.

`published.ts` excludes unverified/rejected records, incomplete bilingual fields, invalid dates, unsupported prices, unknown district/crop IDs and duplicate record IDs. MSP, mandi and government-centre records require official sources. A regulated input price requires an official source; MRP requires a manufacturer or official source. Dealer quotations remain clearly labelled quotations.

Prices are stored as rupee numbers with at most two decimal places. Store dates as `YYYY-MM-DD`, not formatted display strings. Do not put ₹ symbols or commas in numeric data fields. Missing values stay absent; do not substitute zero.

The same mandi must use a consistent, stable `mandiId`, name and district across records. Each observation needs its own unique record ID. A later date is another observation, not evidence that an older observation is today's price.

### Optional state support

Attach verified Chhattisgarh assistance to the appropriate MSP record as `stateSupport`, with its own name, amount, basis, effective date, source, reporting date and verification. It appears separately and is **not added automatically** to MSP or comparison totals.

### Contact and operational details

Only add known contact information. Call buttons require a usable phone number. Directions require valid coordinates or an actual address; they open a map only when tapped. No verification badges are manufactured. A centre's `operation` needs its own official evidence and reporting date; otherwise no operating status appears.

## Supplied document mapping

The workspace was searched for **“Chhattisgarh Agricultural Data & App Specifications”**. No accessible copy was found. The pasted task describes requirements, not price or dealer records. No contents or claims have been inferred from the missing document.

When supplied, map its crop-price tables to `msp.ts`, market observations to `mandiPrices.ts`, business listings to `dealers.ts`, product-price schedules to `inputPrices.ts`, and public facilities to `centres.ts`. Stage every unsupported claim in `review.ts` first.

## Calculator and comparison

- Quantity is in quintals, with up to three decimal places. Price/cost fields allow two decimal places.
- Hindi digits and properly grouped Indian/western numbers are accepted. Negative inputs, exponent notation, invalid grouping, excessive precision and unsafe arithmetic are rejected.
- Gross = quantity × price; deductions = transport + other; net = gross − deductions. Money is calculated in fixed-point paise, rounded once at gross value. Negative net results remain visible with an explanation.
- Comparison requires matching crop ID, grade ID and unit. Each selling option has separate transport and deduction inputs. Record dates remain visible. The app makes no automatic selling recommendation.

## Price preferences

One current preference is saved locally under `mor_kisani_market_preference_v1`. Web uses the existing browser storage pattern; native uses the installed Expo SecureStore. The record includes crop, district, mandi name, optional known mandi ID, target price, version and saved timestamp. Saving replaces the previous preference.

Farmers may enter their own mandi name if the directory is empty. This is a private preference, not a published business or government record. **No notification service is connected or claimed.**

## Files and backups

Existing files modified for this feature only:

- `src/app/(tabs)/index.tsx`: one entry in the existing Home services list.
- `src/app/_layout.tsx`: register the nested market stack.
- `src/config/localization.ts`: include the market dictionary in the existing translator.

Their pre-feature copies are under `.backups/market-20261031-232617/`, retaining their original relative paths.

New files:

- `src/app/market/{_layout,index,msp,mandi,dealers,inputs,calculator,centres,comparison,alerts}.tsx`
- `src/components/market/{MarketUI,SaleForm}.tsx`
- `src/types/market.ts`
- `src/config/marketTranslations.ts`
- `src/data/market/{catalogue,msp,mandiPrices,dealers,inputPrices,centres,review,published}.ts`
- `src/utils/{market,saleCalculator,marketPreference}.ts`
- `src/services/marketPreferences.ts`
- `tests/market.test.ts`
- `scripts/review-market-ui.cjs` and `scripts/market-browser.cjs`
- This guide and generated visual-review artifacts under `artifacts/market-review/`.

The market feature adds no packages and makes no backend changes. Earlier navigation/Hindi refinements remain in place.

## Validation completed

- TypeScript and Expo lint passed; all 22 unit tests passed.
- Expo web export succeeded.
- Chrome checks passed for all eight screens in Hindi and English at 320px width, Home/card/back navigation, offline calculation and invalid-input handling, offline preference saving and restoration after reload.
- No external data requests occurred during the market checks. Existing Crops, Schemes, Settings and Crop Doctor routes opened successfully; no runtime exceptions were observed.
- Screenshots and the machine-readable result are in `artifacts/market-review/`. Run `node scripts/review-market-ui.cjs` against a fresh `dist-review` web export to repeat the browser review.
- Physical Android/iOS device testing was not performed. Production data-dependent views remain empty until verified manual records are supplied; their validation and comparison rules are covered by unit tests.
