---
title: Cloudflare Pages hosting
description: Host the static documentation in a maintainer's Cloudflare account.
---

The documentation is hosted on Cloudflare Pages at [ttlc.docs.isaackogan.com](https://ttlc.docs.isaackogan.com/). Deploy the static output in `docs/dist`. Hosting lives in a maintainer's account while the documentation source stays in the public upstream repository. The site does not need Pages Functions, a Cloudflare Astro adapter, or TikTok credentials.

Use `https://ttlc.docs.isaackogan.com` as the public origin for documentation links, canonical URLs, and the sitemap.

## Build settings

When building a checkout of TikTok-Live-Connector, use these settings:

| Setting | Value |
| --- | --- |
| Production source branch | `ts-rewrite` |
| Root directory | Repository root; leave the field empty |
| Framework preset | None; use the explicit command below |
| Build output directory | `docs/dist` |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `10.34.2` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| `DOCS_SITE` | `https://ttlc.docs.isaackogan.com` |
| `DOCS_BASE` | `/` |

Build command:

```sh
pnpm install --frozen-lockfile && pnpm --dir docs install --frozen-lockfile && pnpm --dir docs build
```

Keep the root at the repository root: TypeDoc needs the connector source and its installed protobuf dependency outside `docs/`. The two installs use separate lockfiles. `SKIP_DEPENDENCY_INSTALL` avoids a separate automatic install choosing another package manager.

The site configuration defaults to the public origin above, so preview deployments share the production canonical origin. Set `DOCS_SITE` to override it when intentionally hosting a separate copy of the documentation.

See Cloudflare's [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) and [build image settings](https://developers.cloudflare.com/pages/configuration/build-image/).

## Connect this repository

After the documentation has merged into `ts-rewrite`:

1. Sign into the maintainer's Cloudflare account and open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and select `zerodytrash/TikTok-Live-Connector`. The Cloudflare GitHub integration must have access to that repository; request approval from its owner if it is not available in the picker.
3. Choose an available project name. Cloudflare assigns a `pages.dev` address from that name; configure the public domain in the project's **Custom domains** settings.
4. Set the production branch to `ts-rewrite`, then apply the build settings and environment variables above to production and any enabled previews.
5. Select **Save and Deploy**. Future pushes to `ts-rewrite` build and publish the site automatically.

The Cloudflare account owns the hosting project; the Markdown, TypeScript source, and build configuration stay in TikTok-Live-Connector. No GitHub Pages setup or deployment secrets in this repository are needed for Git integration.

Cloudflare does not create Git-integration previews for pull requests from forks. Use the GitHub documentation build artifact or a local preview for those reviews. See [Cloudflare's GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/).

## Direct Upload alternative

If Git integration cannot be authorized, the maintainer can publish a build from a checkout of this same repository using [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/):

```sh
npx wrangler@4 login
npx wrangler@4 pages project create YOUR_PROJECT --production-branch=ts-rewrite
DOCS_SITE=https://ttlc.docs.isaackogan.com DOCS_BASE=/ pnpm --dir docs build
npx wrangler@4 pages deploy docs/dist --project-name=YOUR_PROJECT --branch=ts-rewrite
```

Run the two dependency-install commands above before building. Replace `YOUR_PROJECT` with the available project name chosen in Cloudflare. Choose Git integration or Direct Upload when creating the Pages project; a Direct Upload project does not automatically follow upstream commits. Rebuild and upload after changes, or configure an authorized CI runner using Cloudflare's linked instructions.

## Verify a deployment

Open [the documentation](https://ttlc.docs.isaackogan.com/) and a direct nested page such as [Power-Ups](https://ttlc.docs.isaackogan.com/guides/power-ups/). Check the event references, generated API and schema pages, and search for “Power-Ups.” Confirm that links use `/`, not a GitHub repository subpath, and that the canonical origin is `https://ttlc.docs.isaackogan.com`.

When changing the public domain, update the Pages project's **Custom domains** settings and DNS, change the default site origin and public documentation links in this repository, update `DOCS_SITE`, and rebuild.
