// Generate against a source revision when historical snapshots do not describe applied SQL.
import process from 'node:process';
import console from 'node:console';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateSQLiteDrizzleJson, generateSQLiteMigration } from 'drizzle-kit/api';

const [baseline, name] = process.argv.slice(2);
if (!baseline || !/^[a-z_]+$/.test(name || '')) {
  throw new Error('Usage: node scripts/generate-schema-migration.mjs <baseline-ref> <name>');
}
const require = createRequire(import.meta.url);
const kitRequire = createRequire(require.resolve('drizzle-kit/api'));
const { build } = kitRequire('esbuild');
const tempDir = resolve('node_modules/.cache/tracktor-migrations');
await mkdir(tempDir, { recursive: true });
async function schemaAt(ref, suffix) {
  const outfile = resolve(tempDir, `${suffix}.mjs`);
  await build({
    entryPoints: ['src/server/db/schema/index.ts'],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    packages: 'external',
    plugins: ref
      ? [
          {
            name: 'baseline',
            setup(builder) {
              builder.onLoad({ filter: /src\/server\/db\/schema\/.*\.ts$/ }, ({ path }) => ({
                contents: execFileSync(
                  'git',
                  ['show', `${ref}:${path.slice(process.cwd().length + 1)}`],
                  { encoding: 'utf8' }
                ),
                loader: 'ts',
                resolveDir: resolve(path, '..')
              }));
            }
          }
        ]
      : []
  });
  return import(pathToFileURL(outfile).href);
}
try {
  const folder = 'src/server/db/migrations';
  const journal = JSON.parse(await readFile(`${folder}/meta/_journal.json`, 'utf8'));
  const previous = await generateSQLiteDrizzleJson(
    await schemaAt(baseline, 'baseline'),
    undefined,
    'snake_case'
  );
  const current = await generateSQLiteDrizzleJson(
    await schemaAt(null, 'current'),
    previous.id,
    'snake_case'
  );
  const statements = await generateSQLiteMigration(previous, current);
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const tag = `${stamp}_${name}`;
  await writeFile(`${folder}/${tag}.sql`, statements.join('\n--> statement-breakpoint\n'));
  await writeFile(`${folder}/meta/${stamp}_snapshot.json`, JSON.stringify(current, null, 2));
  journal.entries.push({
    idx: journal.entries.length,
    version: current.version,
    when: Date.now(),
    tag,
    breakpoints: true
  });
  await writeFile(`${folder}/meta/_journal.json`, JSON.stringify(journal, null, 2));
  console.log(`${tag}: ${statements.length} generated statements`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
