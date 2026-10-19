import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(docsRoot, '..');
const contentRoot = path.join(docsRoot, 'src/content/docs');

async function filesIn(directory, extension) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (['api', 'schema'].includes(entry.name)) return [];
            return filesIn(file, extension);
        }
        return entry.name.endsWith(extension) ? [file] : [];
    }));
    return files.flat().sort();
}

const pages = await Promise.all((await filesIn(contentRoot, '.md')).map(async (file) => ({
    file, text: await readFile(file, 'utf8'),
})));
const prose = pages.map(({ text }) => text).join('\n');
assert(!/discord\.(com|gg)/i.test(prose), 'Published pages must not reference Discord.');

function sourceFile(relativePath) {
    return readFile(path.join(root, relativePath), 'utf8').then((text) =>
        ts.createSourceFile(relativePath, text, ts.ScriptTarget.Latest, true));
}

const eventSource = await sourceFile('src/types/events.ts');
const catalog = pages.find(({ file }) => file === path.join(contentRoot, 'events/index.md')).text;
let eventCount = 0;
for (const statement of eventSource.statements) {
    if (!ts.isEnumDeclaration(statement) || !['WebcastEvent', 'ControlEvent'].includes(statement.name.text)) continue;
    for (const member of statement.members) {
        const name = `${statement.name.text}.${member.name.getText(eventSource)}`;
        assert(prose.includes(`\`${name}\``), `Missing event documentation: ${name}`);
        if (statement.name.text === 'WebcastEvent') {
            const alias = member.initializer.text;
            assert(catalog.includes(`| \`${name}\` | \`${alias}\` |`), `Event alias is stale: ${name}`);
            const handler = eventSource.statements.find((node) => ts.isTypeAliasDeclaration(node) && node.name.text === 'ClientEventMap');
            const property = handler.type.members.find((node) => node.name?.getText(eventSource) === `[${name}]`);
            if (property && ts.isTypeReferenceNode(property.type) && property.type.typeArguments?.length) {
                const payload = property.type.typeArguments[0].getText(eventSource);
                assert(catalog.includes(`| \`${name}\` | \`${alias}\` | \`${payload}\` |`), `Event payload is stale: ${name}`);
            }
        }
        eventCount++;
    }
}

const schemaSource = await sourceFile('node_modules/tiktok-live-proto/dist/node/v3.d.ts');
const cardEnum = schemaSource.statements.find((node) => ts.isEnumDeclaration(node) && node.name.text === 'BattleCardMsgType');
const cardActions = new Set(cardEnum.members.map((member) => member.name.getText(schemaSource)));
const cardGuide = pages.find(({ file }) => file.endsWith('/guides/power-ups.md')).text;
for (const match of cardGuide.matchAll(/`((?:USE_|AWARD_|CARD_OBTAIN_|SPECIAL_EFFECT_|UNKNOWN_CARD_)[A-Z0-9_]+)`/g)) {
    assert(cardActions.has(match[1]), `Unknown Power-Up action in the guide: ${match[1]}`);
}

const optionsSource = await sourceFile('src/types/client.ts');
const documentedOptions = pages.find(({ file }) => file.endsWith('/configuration/options.md')).text;
const options = new Set();
for (const statement of optionsSource.statements) {
    if (!ts.isTypeAliasDeclaration(statement) || ![
        'TikTokLiveConnectionOptions', 'TikTokLiveConnectionProviderOptions', 'TikTokLiveConnectionBundledAuthOptions',
    ].includes(statement.name.text)) continue;
    function visit(node) {
        if (ts.isPropertySignature(node)) options.add(node.name.getText(optionsSource));
        ts.forEachChild(node, visit);
    }
    visit(statement.type);
}
for (const option of options) {
    assert(documentedOptions.includes(`\`${option}\``), `Missing connection option: ${option}`);
}

const routeSource = await sourceFile('src/lib/web/config.ts');
const routeDocs = pages.find(({ file }) => file.endsWith('/advanced/routes.md')).text;
let routeCount = 0;
for (const statement of routeSource.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
        if (declaration.name.getText(routeSource) !== 'RouteConfig') continue;
        const object = ts.isSatisfiesExpression(declaration.initializer)
            ? declaration.initializer.expression : declaration.initializer;
        for (const property of object.properties) {
            assert(routeDocs.includes(`\`${property.name.getText(routeSource)}\``), 'A RouteConfig member is undocumented.');
            routeCount++;
        }
    }
}

const clientSource = await sourceFile('src/lib/client/index.ts');
for (const statement of clientSource.statements) {
    if (!ts.isClassDeclaration(statement) || statement.name?.text !== 'TikTokLiveConnection') continue;
    for (const member of statement.members) {
        if (!member.name || member.modifiers?.some(({ kind }) => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(kind))) continue;
        assert(prose.includes(`\`${member.name.getText(clientSource)}`), `Missing public client member: ${member.name.getText(clientSource)}`);
    }
}

const envDocs = pages.find(({ file }) => file.endsWith('/configuration/environment.md')).text;
const envNames = new Set();
for (const file of await filesIn(path.join(root, 'src'), '.ts')) {
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) envNames.add(match[1]);
}
for (const name of envNames) assert(envDocs.includes(`\`${name}\``), `Missing environment variable: ${name}`);

// Compile the exact examples readers see, without making network requests.
const temporaryRoot = path.join(docsRoot, '.astro', 'examples');
await rm(temporaryRoot, { recursive: true, force: true });
await mkdir(temporaryRoot, { recursive: true });
const snippets = [];
try {
    const examplePages = [...pages, { file: path.join(root, 'README.md'), text: await readFile(path.join(root, 'README.md'), 'utf8') }];
    for (const page of examplePages) {
        let index = 0;
        for (const match of page.text.matchAll(/^```(?:ts|typescript)\s*\n([\s\S]*?)^```/gm)) {
            const relative = path.relative(root, page.file);
            const file = path.join(temporaryRoot, `${snippets.length}.mts`);
            await writeFile(file, `${match[1]}\nexport {};\n`);
            snippets.push({ file, label: `${relative}, example ${++index}` });
        }
    }
    const configPath = path.join(root, 'tsconfig.json');
    const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);
    assert(!error, 'Cannot read the library tsconfig.');
    const { options: compilerOptions } = ts.parseJsonConfigFileContent(config, ts.sys, root);
    const program = ts.createProgram(snippets.map(({ file }) => file), {
        ...compilerOptions,
        noEmit: true,
        rootDir: root,
        baseUrl: root,
        paths: { ...compilerOptions.paths, 'tiktok-live-connector': ['src/index.ts'] },
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) {
        const labels = new Map(snippets.map(({ file, label }) => [file, label]));
        const host = {
            getCanonicalFileName: (file) => labels.get(file) ?? file,
            getCurrentDirectory: () => root,
            getNewLine: () => '\n',
        };
        console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
        process.exitCode = 1;
    } else {
        console.log(`Checked ${pages.length} pages, ${eventCount} events, ${options.size} connection options, ${routeCount} routes, ${envNames.size} environment variables, and ${snippets.length} TypeScript examples.`);
    }
} finally {
    await rm(temporaryRoot, { recursive: true, force: true });
}
