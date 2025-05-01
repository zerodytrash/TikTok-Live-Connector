import pkg from './package.json';
import * as fs from 'node:fs';

fs.writeFileSync('./src/version.ts', `export const VERSION: string = "${pkg.version}";\n`, { encoding: 'utf-8' });
console.log(`Version updated to ${pkg.version}`);
