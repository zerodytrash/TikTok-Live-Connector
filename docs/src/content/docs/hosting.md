---
title: Cloudflare Workers hosting
description: Host the static documentation on Cloudflare Workers static assets under a custom domain.
---

The site is deployed to Cloudflare Workers as static assets and served at `https://ttlc.docs.isaackogan.com/`. Hosting lives in a maintainer's Cloudflare account while the documentation source stays in the public upstream repository. There is no Worker script: `docs/wrangler.jsonc` only declares the asset directory, HTML handling, and the custom domain. The site needs no Pages Functions, no Cloudflare Astro adapter, and no TikTok credentials.

## Configuration

```jsonc
{
  "name": "tiktok-live-connector-docs",
  "compatibility_date": "2026-10-19",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  },
  "workers_dev": false,
  "routes": [
    { "pattern": "ttlc.docs.isaackogan.com", "custom_domain": true }
  ]
}
```

- `html_handling: auto-trailing-slash` matches Astro's `trailingSlash: 'always'`. A request for `/guides/power-ups` redirects to `/guides/power-ups/`, which serves `guides/power-ups/index.html`.
- `not_found_handling: 404-page` serves Starlight's generated `404.html` with a 404 status.
- `workers_dev: false` keeps the site off the `workers.dev` hostname so the custom domain is the only public origin.
- The `routes` entry with `custom_domain: true` makes Cloudflare create the DNS record and the certificate for the hostname on deploy. The `isaackogan.com` zone must be in the same Cloudflare account as the Worker, and the hostname must not already have a DNS record.

`DOCS_SITE` overrides the canonical origin and defaults to the custom domain. `DOCS_BASE` sets the deployment subpath and defaults to `/`. Neither needs to be set for a production build.

See Cloudflare's [static assets](https://developers.cloudflare.com/workers/static-assets/) and [custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) documentation for the underlying behavior.

## Deploy from a checkout

Wrangler is pinned in `docs/package.json`, so the second install below provides it. Run `pnpm --dir docs exec wrangler login` once on a new machine.

```sh
pnpm install --frozen-lockfile
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs build
pnpm --dir docs run deploy:cloudflare
```

The first deploy creates the Worker and attaches the custom domain. Later deploys upload only the files that changed.

## Continuous deployment

The documentation workflow in `.github/workflows/docs.yml` validates pull requests and uploads the built site as a review artifact. On pushes to `ts-rewrite` it also deploys with `cloudflare/wrangler-action` when the repository has two Actions secrets:

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A token created from the **Edit Cloudflare Workers** template, scoped to the hosting account and the `isaackogan.com` zone |
| `CLOUDFLARE_ACCOUNT_ID` | The hosting account's ID, shown by `wrangler whoami` |

Without the secrets the deploy step is skipped and the workflow still validates the build, so forks and pull requests are unaffected. Adding repository secrets requires admin access to the upstream repository.

## Verify a deployment

```sh
curl -I https://ttlc.docs.isaackogan.com/guides/power-ups/
curl -I https://ttlc.docs.isaackogan.com/guides/power-ups
curl -I https://ttlc.docs.isaackogan.com/missing/
```

Expect a 200, a 307 redirect to the trailing-slash form, and a 404 in that order. Then open the site, check the event references and the generated API and schema pages, and search for "Power-Ups". The canonical link in the page head must use the custom domain.

## Changing the hostname

Edit `pattern` in `docs/wrangler.jsonc`, change the default `site` in `docs/astro.config.mjs`, update the hosted links in the repository README, and deploy. Cloudflare provisions the new hostname on the next deploy. Remove the old one under the Worker's **Settings → Domains & Routes** in the Cloudflare dashboard.
