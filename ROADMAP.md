# BetaManuscript SEO/GEO roadmap

Source: `Audit SEO_GEO et plan de contenu pour BetaManuscript.pdf`.

This roadmap records only decisions accepted for implementation. It separates repository-verified behaviour from SEO hypotheses that require Search Console, Bing Webmaster Tools, or keyword-tool data.

## Product decisions already made

- BetaManuscript is an immediately accessible MVP, not a waitlist product.
- Public plan name: **Author**. The database enum remains `pro` as an internal implementation detail.
- Public sharing is opt-in: private invitations are the default; authors can enable a shareable reading page for one reading round.
- Do not publish mock product captures, placeholders, fabricated reader data, or unverified claims.
- Do not position BetaManuscript as a universal replacement for Google Docs. It is a dedicated workflow for independent beta-reader feedback.
- Homepage positioning changes proposed by the audit were rejected. Do not change its title, H1, definition, or CTA as part of this roadmap.

## 0. Corrections completed

- [x] Remove waitlist runtime, copy, environment example, and documentation.
- [x] Replace public `Pro` plan wording with `Author`.
- [x] Remove public screenshot placeholders and illustrative fake data.
- [x] Correct the false claim that manuscripts have "no public sharing".

## 1. Use-case cluster

### 1.1 Hub: `/use-cases`

Status: implemented.

1. Keep the existing title: `Beta Reading Use Cases for Authors | BetaManuscript`.
2. Keep the existing H1: `A better workflow for every stage of your beta reading round.`
3. List every cluster use case in the hub.
4. Link every published use case from the hub with descriptive link text.
5. Maintain descriptive link text rather than generic calls to action.

### 1.2 Existing page: `/use-cases/organize-beta-reader-feedback`

Status: existing; textual corrections completed.

1. Keep the current title and H1.
2. Keep the context model: passage, chapter, reader, feedback category, and survey responses.
3. Add a real product capture only when one can be supplied and verified. Its alt text must describe the actual UI.
4. Preserve the distinction between recurring reactions and an instruction to rewrite.
5. Maintain links to the workflow, pricing, and multi-reader use case.

### 1.3 Existing page: `/use-cases/manage-multiple-beta-readers`

Status: existing; public plan wording corrected.

1. Keep the promise: multiple independent readers without losing the author overview.
2. Preserve the explicit non-marketplace boundary: authors bring their own readers.
3. Add a real product capture only when available; never restore an illustrative mock.
4. Keep the FAQ factual: reader privacy, browser access, progress, surveys, and pricing limits.

### 1.4 New page: `/use-cases/google-docs-alternative-for-beta-reading`

Status: implemented in this change.

1. Title: `Google Docs Alternative for Beta Reading | BetaManuscript`.
2. Meta description: `Looking for a Google Docs alternative for beta reading? Keep reader feedback separate, track progress, run surveys, and review recurring issues in one workspace.`
3. H1: `A Google Docs alternative built for beta reading.`
4. State the honest boundary: Google Docs remains appropriate for collaborative line editing and close co-writing.
5. Explain the specialist workflow: independent readers, dedicated reading experience, passage and chapter context, surveys, progress, and recurring reactions.
6. Do not claim that BetaManuscript replaces Google Docs as a writing editor.
7. Include the validated FAQ and the CTA `Run your next beta round outside Google Docs`.
8. Link to the hub, workflow, multi-reader, and feedback-organization pages.

### 1.5 New page: `/use-cases/track-beta-reader-progress`

Status: implemented.

1. Keep the copy limited to verified author signals: pending invitations, readers who started or completed the round, and feedback activity.
2. Title: `Track Beta Reader Progress | BetaManuscript`.
3. H1: `Know where your beta readers are without chasing them for updates.`
4. Explain what progress means and what it does not mean; do not frame it as a measure of reader quality.
5. Connect progress to submitted feedback only where the implementation supports that distinction.
6. Add factual FAQs for chapter progress, reader pace, multiple readers, and saved progress.

### 1.6 New page: `/use-cases/share-manuscript-with-beta-readers`

Status: implemented.

1. Keep the copy limited to verified access behaviour: private invitations, a shareable reading page, feedback accounts, invitation revocation, and disabling a shareable page.
2. Title: `Share a Manuscript with Beta Readers | BetaManuscript`.
3. H1: `Share your manuscript with beta readers without sending loose files.`
4. Describe both verified access paths: private invitations and a shareable reading page.
5. Do not describe the product as DRM or imply that a shareable link cannot be forwarded.
6. Explain how reading progress and feedback remain connected to the same beta round.

### 1.7 New page: `/use-cases/beta-reader-surveys`

Status: implemented.

1. Use the verified plan limit when pricing is mentioned: two surveys on Free and unlimited surveys on Author.
2. Title: `Beta Reader Surveys & Questionnaires | BetaManuscript`.
3. H1: `Ask beta readers the right questions while the story is still fresh.`
4. Explain the difference between passage annotations and broader chapter/manuscript questions.
5. Include practical guidance: use a small, deliberate question set and avoid leading readers.
6. Link answers back to annotations only where the shared context is implemented.

## 2. Supporting pages and internal links

### `/how-it-works`

1. Keep its existing H1.
2. Add a contextual link to the Google Docs page: `Still managing beta readers in Google Docs? See the dedicated Google Docs alternative for beta reading.`
3. Keep this page focused on the product workflow rather than turning it into a full comparison page.

### `/pricing`

1. Add contextual links to multi-reader and survey use cases only after those destination pages are live.
2. Recheck every plan limit, currency, billing period, and entitlement against pricing configuration before changing public copy.

### `/for-readers`

1. Keep it focused on the reader experience; do not target author-management or Google Docs queries here.
2. Optional future addition: a concise reader-focused product definition, only if it improves clarity.

### Homepage

1. No SEO copy change is authorized by the current decisions.
2. Revisit only after actual GSC/Bing data establishes a query opportunity and a specific hypothesis.

## 3. Discoverability and technical SEO

1. Add every published route to `src/app/sitemap.ts`.
2. Confirm canonical metadata for each public page.
3. Link every published use case from the hub and at least one relevant product page.
4. Inspect each new URL in Google Search Console before measuring content performance.
5. Verify that the server-rendered HTML exposes the main headings, links, and copy without requiring an interaction.
6. Build English authority first. Do not translate the cluster until the English pages and their query data justify it.

## 4. Measurement and iteration

1. Establish a baseline in Google Search Console and Bing Webmaster Tools once each page is published.
2. Use Semrush, Ahrefs, or Ubersuggest only to validate search demand and competitor-query gaps; do not treat their figures as first-party truth.
3. Review impressions, query variants, position, CTR, and referral/conversion signals by URL.
4. Change one meaningful variable at a time: title/meta, H1/intro, or CTA. Do not change all three in the same test window.
5. If a page gains impressions but ranks 8-20, enrich its evidence and internal links. If CTR is low at a good position, test title/meta. If it is not indexed, fix technical discoverability before rewriting copy.

## 5. Explicit non-goals

- No generic blog expansion merely to increase page count.
- No separate "GEO trick" layer: useful, original, crawlable pages are the strategy.
- No fake testimonials, product screenshots, reader counts, or performance claims.
- No public copy that contradicts sharing behaviour, plan names, or available functionality.
