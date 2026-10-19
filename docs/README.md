# Documentation

Published documentation: [TikTok LIVE Connector](https://ttlc.docs.isaackogan.com/).

The site uses Astro Starlight, TypeDoc, and Starlight Links Validator. Its dependencies are isolated from the published connector package.

Use Node.js 22.22 or newer and pnpm 10.34.2. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs dev
```

Validate and build:

```sh
pnpm --dir docs check
pnpm --dir docs build
pnpm --dir docs preview
```

Authored pages live in `src/content/docs/`. The `api/` and `schema/` directories there are generated from the connector source and the installed protobuf dependency; they are ignored by Git. Do not edit the generated Markdown.

`check` verifies public-surface coverage and compiles the authored TypeScript examples. `build` also validates links and generates the search index. See the site's contributing page for authoring and deployment details.

## Hosting

The site is hosted on Cloudflare Pages at `https://ttlc.docs.isaackogan.com/`. The GitHub workflow only validates and uploads review artifacts; it does not deploy to GitHub Pages.

See [Cloudflare Pages hosting](https://ttlc.docs.isaackogan.com/hosting/) for exact build settings, connecting this repository to Cloudflare, and publishing into the maintainer's Cloudflare account.

The configured public origin defaults to `https://ttlc.docs.isaackogan.com`. Use `DOCS_SITE` to override it for another deployment and `DOCS_BASE` for a subpath; production uses `/`.
