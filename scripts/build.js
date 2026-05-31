import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { minify } from 'terser';
import JavaScriptObfuscator from 'javascript-obfuscator';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shouldObfuscate = process.argv.includes('--obfuscate');
const outDir = path.join(rootDir, shouldObfuscate ? 'dist-protected' : 'dist');
const bundlePath = path.join(outDir, 'app.js');

const packageJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
const externalPackages = [
    ...Object.keys(packageJson.dependencies || {}),
    'node:*'
];

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

await build({
    entryPoints: [path.join(rootDir, 'src/main.js')],
    outfile: bundlePath,
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    packages: 'external',
    external: externalPackages,
    minify: true,
    sourcemap: false,
    legalComments: 'none',
    banner: {
        js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);'
    },
    logLevel: 'info'
});

const bundledCode = await fs.readFile(bundlePath, 'utf8');
const terserResult = await minify(bundledCode, {
    module: true,
    compress: {
        passes: 2,
        pure_funcs: ['console.log', 'console.debug', 'console.trace']
    },
    mangle: true,
    format: {
        comments: false
    }
});

if (!terserResult.code) throw new Error('Terser no generó código de salida.');

const finalCode = shouldObfuscate
    ? JavaScriptObfuscator.obfuscate(terserResult.code, {
        compact: true,
        target: 'node',
        renameGlobals: false,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        selfDefending: false,
        simplify: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.6
    }).getObfuscatedCode()
    : terserResult.code;

await fs.writeFile(bundlePath, `${finalCode}\n`);

await fs.writeFile(
    path.join(outDir, 'package.json'),
    `${JSON.stringify({
        name: packageJson.name,
        version: packageJson.version,
        private: true,
        type: 'module',
        main: 'app.js',
        dependencies: packageJson.dependencies
    }, null, 2)}\n`
);

console.info(`Build ${shouldObfuscate ? 'protegido' : 'estándar'} generado en ${path.relative(rootDir, outDir)}.`);
