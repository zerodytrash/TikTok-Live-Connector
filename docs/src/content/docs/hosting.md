---
title: Cloudflare Pages hosting
description: Host the static documentation in a maintainer's Cloudflare account.
---

Deploy `docs/dist` to Cloudflare Pages and use the project's assigned `pages.dev` address. Hosting can live in a maintainer's account while the documentation source stays in the public upstream repository. This is a static site; it does not need Pages Functions, a Cloudflare Astro adapter, or TikTok credentials.

Choose the project name in Cloudflare before setting `DOCS_SITE` or adding a public site link to the README. Until the first deployment, the README links to the checked-in documentation. Once the address is confirmed, replace those event-reference links with the corresponding hosted paths.

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
| `DOCS_SITE` | The actual public origin, such as the assigned `https://PROJECT.pages.dev` |
| `DOCS_BASE` | `/` |

Build command:

```sh
pnpm install --frozen-lockfile && pnpm --dir docs install --frozen-lockfile && pnpm --dir docs build
```

Keep the root at the repository root: TypeDoc needs the connector source and its installed protobuf dependency outside `docs/`. The two installs use separate lockfiles. `SKIP_DEPENDENCY_INSTALL` avoids a separate automatic install choosing another package manager.

Cloudflare provides `CF_PAGES_URL` for each deployment. The site uses it when `DOCS_SITE` is unset. Set `DOCS_SITE` explicitly when production and preview builds should share one canonical origin. No DNS changes are needed for the assigned `pages.dev` address.

See Cloudflare's [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) and [build image settings](https://developers.cloudflare.com/pages/configuration/build-image/).

## Connect this repository

After the documentation has merged into `ts-rewrite`:

1. Sign into the maintainer's Cloudflare account and open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
2. Connect GitHub and select `zerodytrash/TikTok-Live-Connector`. The Cloudflare GitHub integration must have access to that repository; request approval from its owner if it is not available in the picker.
3. Choose an available project name. Cloudflare assigns its `pages.dev` address from that name.
4. Set the production branch to `ts-rewrite`, then apply the build settings and environment variables above to production and any enabled previews.
5. Select **Save and Deploy**. Future pushes to `ts-rewrite` build and publish the site automatically.

The Cloudflare account owns the hosting project; the Markdown, TypeScript source, and build configuration stay in TikTok-Live-Connector. No GitHub Pages setup or deployment secrets in this repository are needed for Git integration.

Cloudflare does not create Git-integration previews for pull requests from forks. Use the GitHub documentation build artifact or a local preview for those reviews. See [Cloudflare's GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/).

## Direct Upload alternative

If Git integration cannot be authorized, the maintainer can publish a build from a checkout of this same repository using [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/):

```sh
npx wrangler@4 login
npx wrangler@4 pages project create YOUR_PROJECT --production-branch=ts-rewrite
DOCS_SITE=https://YOUR_PROJECT.pages.dev DOCS_BASE=/ pnpm --dir docs build
npx wrangler@4 pages deploy docs/dist --project-name=YOUR_PROJECT --branch=ts-rewrite
```

Run the two dependency-install commands above before building. Replace `YOUR_PROJECT` with the available project name chosen in Cloudflare. Choose Git integration or Direct Upload when creating the Pages project; a Direct Upload project does not automatically follow upstream commits. Rebuild and upload after changes, or configure an authorized CI runner using Cloudflare's linked instructions.

## Verify a deployment

Open the assigned `pages.dev` address and a direct nested URL such as `/guides/power-ups/`. Check the event references, generated API and schema pages, and search for “Power-Ups.” Confirm that links use `/`, not a GitHub repository subpath, and that the canonical origin is the deployed site.

For a later custom domain, add the domain in the Pages project's **Custom domains** settings, follow Cloudflare's DNS instructions, update `DOCS_SITE`, and rebuild. A custom domain is optional; the initial deployment can stay on `pages.dev`.
