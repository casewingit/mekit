# MEKIT app design proposal

Date: 2026-10-09
Status: Approved by the user on 2026-10-10; customer MVP implemented.
Source: `/Users/case/Downloads/MEKIT_._App-in-Toss_.md`

## Purpose

Build a Korean-language bracelet shopping app around “Make it your own”: four finished designs, a length matched to the customer's wrist, and one price per product across all supported lengths.

The supplied Markdown is the product specification. Its business exercises, supplier outreach, legal reviews, and launch checklist are context rather than instructions to contact third parties or publish the app.

## Approaches

1. **Working customer MVP — recommended.** Build the complete customer journey in React and TypeScript with a browser preview and explicit demo checkout. Separate product, sizing, order, and payment logic so real backend and Toss integrations can replace demo services. This provides a usable app quickly without implying that payments or fulfillment are connected.
2. **Production commerce platform.** Build the customer app, authenticated backend, PostgreSQL inventory and order system, payment reconciliation, and a separate operations app. This follows the document's full technical roadmap but also requires merchant credentials, infrastructure, verified product specifications, and business policies.
3. **Visual prototype.** Build collection and product screens with limited interactions. This makes visual review fast but does not validate the complete customer journey.

## Recommended first deliverable

A runnable, responsive customer MVP with the following screens and interactions:

- Home and collections: MEKIT text wordmark, brand statement, four product cards, sizing entry point, and material archive.
- Product detail: EARTH, INDUSTRY, AMBER, and FRAGMENT stories, illustrated product previews, material information, care guidance, prices, and estimated lead time.
- Size selection: wrist circumference or direct finished length, fit preference, calculated recommendation, and reactive 2D composition preview.
- Checkout: order summary, recipient and delivery form, field validation, separate required acknowledgements, and explicitly labeled demo order creation.
- Order confirmation and orders: selected specifications, order number, estimated dates, and a production/shipping timeline. Include an empty state and request flows for cancellation, returns, and repairs.
- Support: FAQ, care information, a local demo inquiry flow, and policy information clearly identified as a draft where business details are unconfirmed.

The demo never claims a real Toss authorization, payment, shipment, customer support submission, or refund occurred. No production personal information should be entered into the demo.

## Visual direction

Use an understated material-focused aesthetic: warm neutral surfaces, charcoal typography, fine borders, generous whitespace, and collection-specific earthy, metallic, amber, and ceramic accents. MEKIT is a text wordmark without a symbol.

The home page introduces the brand, then makes the four collections easy to compare. Desktop uses a wider editorial layout and a multi-column product grid. Mobile uses a compact header, readable cards, and reachable primary actions. Purchase forms favor familiar, clear controls suitable for eventual TDS integration.

Product illustrations and 2D previews are concept visuals, labeled as composition examples rather than verified photographs or true-size representations. Replace them with approved product photography before selling.

## Product and size rules

| Collection | Proposed price | Material concept |
| --- | ---: | --- |
| EARTH | 39,000 KRW | Wood, natural stone, brass, traditional knot |
| INDUSTRY | 49,000 KRW | Stainless steel, titanium, dark knot |
| AMBER | 45,000 KRW | Glass, brass, amber-colored ceramic, knot |
| FRAGMENT | 47,000 KRW | Ceramic, glass, natural stone, mixed metal |

Prices and material descriptions remain proposal data from the source, not independently verified specifications.

- Finished lengths: 15–21 cm inclusive, in 0.5 cm increments.
- Fit allowances: snug +0.5 cm, comfortable +1.0 cm, loose +1.5 cm.
- Wrist measurements: selectable in 0.5 cm increments. Allow valid measurements whose recommendation may fall outside the supported finished-length range.
- An unsupported recommended length shows a consultation prompt and blocks ordering that configuration. Do not silently clamp the recommendation.
- Direct finished-length entry uses the same range and increment checks.
- The price stays constant for every supported length of the same product.
- Show wrist circumference, fit allowance, and finished length as distinct labeled values.
- Show the proposed ±0.3 cm completion tolerance before order submission.
- Preview composition responds to length using product-specific bead spacing and count rules. It does not promise exact manufacturing output.

## Architecture and data flow

React + TypeScript with Vite provides the browser app. Keep catalog data, size calculation, rendering, checkout validation, and order persistence in focused modules.

Route state supports browser back/forward navigation and direct entry to collections, products, sizing, orders, and support. UI state carries the selected product and size into checkout.

Catalog and size rules are authoritative application data in the demo. A demo order records a snapshot of the product name, price, selected length, and placement time. Store only non-sensitive demonstration order metadata locally; recipient, phone, and address inputs are transient and are not written to local storage.

Separate service interfaces cover catalog retrieval, quotes, order creation, payment, and support requests. Production replacement requires server-calculated quotes, authenticated ownership checks, inventory reservations, idempotency, and server-verified payment status.

The first deliverable does not include a production database, real admin authentication, inventory management, live Toss login/payment, courier integration, or platform submission. These are follow-on work rather than completed capabilities.

## Error handling and accessibility

Validate size, required delivery fields, and acknowledgements before submission. Prevent duplicate submission while creating an order. Handle unavailable local storage and corrupted demo data without breaking the app. Explain cancellation and request outcomes accurately.

Use semantic landmarks, named controls, keyboard focus indicators, accessible dialogs, error descriptions attached to fields, and selected-state indicators beyond color. Account for mobile safe areas, large text, reduced motion, and narrow screens.

## Verification

- TypeScript checks and production build.
- Unit checks for size recommendations, range boundaries, increments, and fixed product pricing.
- Browser verification of all four products, size-mode switching, changing fit, unsupported size messaging, form validation, demo order creation, order recovery, support flows, and browser navigation.
- Visual inspection at desktop and mobile widths; verify no horizontal overflow and that primary actions remain reachable.

## Production follow-on requirements

Connect official App in Toss WebView SDK/TDS and server-side Toss authentication/payment after credentials and merchant approval are available. Finalize product BOMs, prices, photography, lead-time rules, business identity, customer support contacts, and legal policies before accepting real orders.

Official policy checked on 2026-10-09: https://developers-apps-in-toss.toss.im/intro/guide.html
Official UX guide: https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.html

## Review

The proposal preserves the source's four-product MVP and deferred free customization. It explicitly separates usable demo behavior from production commerce integrations. Approval of this proposal selects approach 1 and authorizes its implementation.

## Approved visual reference

On 2026-10-10, the user requested the concept images in GitHub issue #1 comments. The app references the MEKIT concept boards with dark stone surfaces, olive traditional knots, wood, brass, and workwear styling. Source: https://github.com/casewingit/mekit/issues/1#issuecomment-6089609572
