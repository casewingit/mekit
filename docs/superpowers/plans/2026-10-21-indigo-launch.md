# INDIGO LINE landing and launch kit implementation plan

**Goal:** Use the user's selected INDIGO LINE image to replace the home landing, align Studio, publish to GitHub Pages from main, and deliver a sourced purchasing/budget/action document separately.

**Authorization:** The user selected the attached visual, requested the landing and moodboard update, and explicitly requested publication. Continue the existing main workflow. Untracked historical archives are outside scope.

**Design:** Ivory and deep navy editorial layout. Four photographic regions of the existing generated Indigo board (whole bracelet, wrist, knot, fabric) rendered through SVG viewports; original pixels retained. Large type and deliberate whitespace, English direction titles plus Korean explanation. No gemstones, no claimed completed strength/metal/2mm verification. Prelaunch state and actual concept provenance visible. Preserve historical demo routes as an explicitly labeled archive.

**Architecture:** New scoped React landing component and stylesheet; Layout renders its independent shell on the home route. Other commerce demo routes retain their existing layout. Studio retains four images and stable board IDs, with Indigo first and latest selected direction text. No fake subscription collection or fabricated sales.

- [x] Implement src/pages/IndigoLanding.tsx and src/indigo.css; update Home export, Layout home shell, page metadata.
- [x] Reorder/update public/studio/boards.js and initial HTML; preserve deep links and existing local notes. Add a product-development boundary to descriptions.
- [x] Update existing browser regression tests for the new home and explicit legacy archive. Test all four visual scenes, mobile overflow, Studio links/default and deep links. Run unit tests, Studio tests, Pages build, browser tests.
- [x] Research actual seller/manufacturer pages. Deliver docs/MEKIT-launch-kit-2026-10-21.md and docs/mekit-startup-budget-2026-10-21.csv with sourced prices vs allowances, exact specifications and open RFQ points, sample-first purchasing order, 14-day plan and templates. Keep business planning out of public/.
- [x] Review sources and budget arithmetic, save source provenance/README instructions, commit only task files to main, push and deploy full Pages build. Verify deployed landing and Studio, save screenshots.

**Acceptance:** Updated root is Indigo-led with four original image regions and working responsive navigation; /studio/ defaults to Indigo; historical demo routes function; no purchase/launch claims invented; concrete supplier URLs and budget calculations delivered; main and Pages verified.

**Verification before publication (2026-10-22):** 41 unit tests, 3 Studio unit tests, 6 Pages browser tests and 12 existing commerce browser tests passed (62 total). Pages production build and diff whitespace check passed. Desktop and 390px mobile visual previews inspected. Budget CSV: 69 rows checked, including independent scenario subtotals, 15% reserve and contribution margin.

**Published and verified (2026-10-22):** Source commit `f53a07a` is on `origin/main`. Pages branch build `38a8de9` was confirmed identical to the validated local dist after the source push. Its generated commit label refers to the previous HEAD because the initial source commit was stopped by CSV CRLF whitespace checks; the CSV was normalized and committed successfully. [GitHub Pages run 39691935891](https://github.com/casewingit/mekit/actions/runs/39691935891) completed successfully. Live root displays INDIGO LINE, its Studio link opens Indigo, and Next switches to Black Knot. Browser error logs were empty on both pages. Desktop proof saved locally at `/tmp/mekit-indigo-live.png`.
