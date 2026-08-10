import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import react from '@vitejs/plugin-react';
import { createServer } from 'vite';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');

const collectTestFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTestFiles(absolutePath);
    return /\.test\.(ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
  }));
  return nestedFiles.flat();
};

const toViteUrl = (filePath) => `/${path.relative(root, filePath).split(path.sep).join('/')}`;

const server = await createServer({
  root,
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(root, 'src/app'),
      '@features': path.resolve(root, 'src/features'),
      '@shared': path.resolve(root, 'src/shared'),
      '@assets': path.resolve(root, 'src/assets'),
    },
  },
  server: { middlewareMode: true },
});

let passed = 0;
let failed = 0;

try {
  const testFiles = (await collectTestFiles(sourceRoot)).sort();

  if (testFiles.length === 0) {
    console.error('No se encontraron archivos *.test.ts o *.test.tsx.');
    process.exitCode = 1;
  }

  for (const testFile of testFiles) {
    const loadedModule = await server.ssrLoadModule(toViteUrl(testFile));
    const suite = loadedModule.suite;

    if (!suite || !Array.isArray(suite.tests)) {
      throw new Error(`${path.relative(root, testFile)} debe exportar una suite válida.`);
    }

    console.log(`\n${suite.name}`);

    for (const testCase of suite.tests) {
      try {
        await testCase.run();
        passed += 1;
        console.log(`  ✓ ${testCase.name}`);
      } catch (error) {
        failed += 1;
        console.error(`  ✗ ${testCase.name}`);
        console.error(error instanceof Error ? error.stack : error);
      }
    }
  }
} finally {
  await server.close();
}

console.log(`\nResultado: ${passed} correctas, ${failed} fallidas.`);

if (failed > 0) process.exitCode = 1;
