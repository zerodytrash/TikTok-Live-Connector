# Documentation

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

The site is served from Cloudflare Workers static assets at <https://ttlc.docs.isaackogan.com/>. `wrangler.jsonc` in this directory declares the asset directory and the custom domain; there is no Worker script. The GitHub workflow validates every change and deploys pushes to `ts-rewrite` when the repository has the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

To deploy from a checkout after the two installs above:

```sh
pnpm --dir docs build
pnpm --dir docs run deploy:cloudflare
```

See [Cloudflare Workers hosting](src/content/docs/hosting.md) for the configuration, secrets, and verification steps. `DOCS_SITE` defaults to the custom domain and `DOCS_BASE` to `/`; neither needs to be set.
