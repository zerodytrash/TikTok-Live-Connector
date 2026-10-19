---
title: Contributing to the docs
description: Build, validate, and maintain the documentation with the library source.
---

## Run locally

The documentation is a private Starlight project under `docs/`. Its dependencies and lockfile are separate from the library's. Building the docs currently requires Node.js 22.22 or newer; the connector package's own Node.js requirement is unchanged.

From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs dev
```

The first command installs the library dependencies needed to resolve its source and installed schema. The second installs the site tooling.

```sh
pnpm --dir docs check
pnpm --dir docs build
```

The content check verifies event, option, route, environment-variable, and public-client-member coverage, then type-checks the TypeScript snippets in authored pages. A production build generates the API and schema pages and validates internal links with Starlight Links Validator.

## Where to edit

- Write guides and event explanations in `docs/src/content/docs/`.
- Edit public API comments at the source declaration so generated reference pages and editor hints agree.
- `api/` and `schema/` inside the content directory are generated and ignored. Do not hand-edit or commit them.
- Keep the generated protobuf reference tied to the installed `tiktok-live-proto` dependency. Do not copy an unrelated schema into the docs.

The event index and grouped references are authored Markdown. When adding or renaming an event, update its enum name, listener string, payload type, and explanation. The coverage check catches omissions; it cannot verify every sentence's meaning.

## Verify behavior

Read the implementation and its tests before describing behavior. Type definitions establish available fields, while dispatch code establishes which named event is emitted. For an uncertain protocol field, describe the known structure and clearly state the limit of its interpretation.

Use short, complete TypeScript examples in `ts` or `typescript` code fences. They are compiled as separate modules against the current source, not executed against live streams. Shell commands use `sh` fences. Historical examples that intentionally use an old API should be explained as such rather than added as passing current examples.

Use synthetic or sanitized data in fixtures. Replaying a fixture verifies decoding and dispatch; it does not prove delivery timing, account eligibility, or every live cohost arrangement.

## Deployment

The documentation workflow builds on relevant pull requests and pushes to `ts-rewrite`. Its manual workflow publishes the built static files through GitHub Pages when a maintainer runs it and Pages is configured to use GitHub Actions.

The build accepts `DOCS_SITE` (site origin) and `DOCS_BASE` (deployment subpath, with leading and trailing slashes). A typical project Pages deployment uses an owner GitHub Pages origin and `/TikTok-Live-Connector/` as its base. The workflow derives those values from the repository so forks can build under their own names.

Check a production build when changing the base path: navigation, generated reference links, assets, and search must all work under that prefix. The site's local development preview uses `/` by default.
