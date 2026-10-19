import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightTypeDoc, { typeDocSidebarGroup, createStarlightTypeDocPlugin } from 'starlight-typedoc';
import starlightLinksValidator from 'starlight-links-validator';
import lucode from 'lucode-starlight';
import { visit } from 'unist-util-visit';
import { readFileSync } from 'node:fs';
import { unified } from '@astrojs/markdown-remark';

const [schemaTypeDoc] = createStarlightTypeDocPlugin();
const base = `/${(process.env.DOCS_BASE || '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const { version: schemaVersion } = JSON.parse(readFileSync(new URL('../node_modules/tiktok-live-proto/package.json', import.meta.url), 'utf8'));

// TypeDoc already includes the base in its links; authored Markdown does not.
function prefixLinks() {
  return (tree) => visit(tree, 'link', (node) => {
    if (node.url.startsWith('/') && !node.url.startsWith('//') && !node.url.startsWith(base)) {
      node.url = `${base}${node.url.slice(1)}`;
    }
  });
}

export default defineConfig({
  site: process.env.DOCS_SITE || 'https://ttlc.docs.isaackogan.com',
  base,
  trailingSlash: 'always',
  markdown: { processor: unified({ remarkPlugins: [prefixLinks] }) },
  integrations: [
    starlight({
      title: 'TikTok LIVE Connector',
      description: 'Connect to TikTok LIVE with Node.js. Guides, events, and TypeScript API reference.',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/zerodytrash/TikTok-Live-Connector' }],
      editLink: { baseUrl: 'https://github.com/zerodytrash/TikTok-Live-Connector/edit/ts-rewrite/docs/' },
      sidebar: [
        { label: 'Start here', items: [
          { label: 'Getting Started', slug: '' },

          { label: 'Connection lifecycle', slug: 'getting-started/connection' },
          { label: 'Migration', slug: 'getting-started/migration' },
        ] },
        { label: 'Configuration', items: [{ autogenerate: { directory: 'configuration' } }] },
        { label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Events', items: [{ autogenerate: { directory: 'events' } }], collapsed: true },
        { label: 'Advanced', items: [{ autogenerate: { directory: 'advanced' } }], collapsed: true },
        { label: 'Troubleshooting', slug: 'troubleshooting' },
        { label: 'Contributing to the docs', slug: 'contributing' },
        { label: 'Hosting', slug: 'hosting' },
        typeDocSidebarGroup,
        { label: 'Protobuf schema', slug: 'schema' },
      ],
      plugins: [lucode({
        navLinks: [
          { label: 'Docs', link: base },
          { label: 'Events', link: `${base}events/` },
          { label: 'API', link: `${base}api/` },
        ],
        footerText: 'Unofficial project, not affiliated with TikTok or ByteDance Ltd. Source on [GitHub](https://github.com/zerodytrash/TikTok-Live-Connector).',
      }), starlightTypeDoc({
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        output: 'api',
        sidebar: { label: 'API reference', collapsed: true },
        typeDoc: {
          name: `TikTok LIVE Connector ${version}`,
          readme: 'none',
          entryFileName: 'index',
          excludePrivate: true,
          excludeProtected: true,
          excludeExternals: true,
          excludeInternal: true,
          validation: { notExported: false },
          sourceLinkTemplate: 'https://github.com/zerodytrash/TikTok-Live-Connector/blob/ts-rewrite/{path}#L{line}',
        },
      }), schemaTypeDoc({
        entryPoints: ['../node_modules/tiktok-live-proto/dist/node/v3.d.ts'],
        tsconfig: './tsconfig.schema.json',
        output: 'schema',
        sidebar: { label: 'Protobuf schema', collapsed: true },
        typeDoc: {
          name: `TikTok Webcast v3 schema (${schemaVersion})`,
          readme: 'none',
          entryFileName: 'index',
          plugin: ['typedoc-plugin-missing-exports'],
          disableSources: true,
        },
      }), starlightLinksValidator()],
    }),
  ],
});
