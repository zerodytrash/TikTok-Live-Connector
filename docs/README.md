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

For a project Pages build, set `DOCS_SITE` to the owner's Pages origin and `DOCS_BASE` to the repository subpath. The GitHub Actions workflow sets these automatically. No site needs to be deployed to develop or review these changes locally.
