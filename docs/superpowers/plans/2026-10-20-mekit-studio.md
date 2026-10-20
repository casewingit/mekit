# MEKIT Studio implementation plan

Goal: publish an image-led review space at https://casewingit.github.io/mekit/studio/ with three Korean-maedeup-inspired bracelet moodboards and a generated gallery UI concept.

Authorization: user requested design opinion, generated moodboards, image representation of the viewing space, series navigation, and GitHub Pages publication. Use existing feature branch; preserve existing landing and unrelated local assets.

Architecture: standalone HTML/CSS/ES modules in public/studio; relative asset URLs work locally and under /mekit/studio/. Gallery data in boards.js; app.js handles navigation, accessible dialog and local notes. No server, authentication or remote note submission. Buildless subdirectory deploy clones gh-pages and updates only studio/.

- [x] Generate three original landscape moodboards with built-in image_gen. Copy originals and prompts into public/studio/images and public/studio/prompts. Inspect every output. Generate a fourth UI moodboard referencing the first three, clearly labeled as interface concept.
- [x] Implement index.html, styles.css, boards.js and app.js. Include previous/next, thumbnails, arrow keys, touch swipe, URL hashes, image enlargement and downloads; local-only notes with explicit save state and export. Provide Korean commentary, English direction titles, cultural sources and concept limitations. No factual performance or origin claims inferred from generated images.
- [x] Add node:test checks for hash/index resolution, navigation wrap, stored-note validation and all image paths. Test keyboard, touch-sized layout, deep links, dialog close and notes persistence in browser.
- [x] Add docs/MEKIT-global-maedeup-direction-2026-10-20.md with overseas strategy opinion, accurate cultural attribution, concepts, sources and generation provenance. Add Studio entry to README.
- [x] Commit/push only this work. Publish studio/ to gh-pages without replacing other content. Verify deployed route and all images, capture final desktop/mobile proof and return public URL.

Design: warm ivory archive with black editorial type, small terracotta accents; generous image stage with readable sidebar, three bracelet directions followed by gallery UI concept. Mobile stacks image before text and retains visible next/previous controls. Review notes remain on the current browser and are never published.

Success: four generated images are present in source and deployed gallery; series can be navigated on desktop and mobile; source/prompt provenance retained; existing landing remains accessible; public URL visibly serves latest gallery.
