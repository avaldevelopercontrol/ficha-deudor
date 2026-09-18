import assert from 'node:assert/strict';
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {
  dirname,
  join,
  relative,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

const PRODUCCION_ONLINE_ROOT = dirname(
  fileURLToPath(import.meta.url)
);

const SRC_ROOT = dirname(
  dirname(PRODUCCION_ONLINE_ROOT)
);

const PUBLIC_ENTRYPOINTS = new Set([
  '@features/produccion-online/navigation',
]);

const listSourceFiles = (
  directory: string
): string[] =>
  readdirSync(directory).flatMap((name) => {
    const absolutePath = join(
      directory,
      name
    );

    if (statSync(absolutePath).isDirectory()) {
      return listSourceFiles(absolutePath);
    }

    return /\.tsx?$/.test(name) &&
      !name.endsWith('.test.ts') &&
      !name.endsWith('.test.tsx')
      ? [absolutePath]
      : [];
  });

const STATIC_IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;
const DYNAMIC_IMPORT_PATTERN =
  /import\s*\(\s*["']([^"']+)["']\s*\)/g;

const extractImportSpecifiers = (
  source: string
): string[] => [
  ...Array.from(
    source.matchAll(STATIC_IMPORT_PATTERN),
    (match) => match[1]
  ),
  ...Array.from(
    source.matchAll(DYNAMIC_IMPORT_PATTERN),
    (match) => match[1]
  ),
].filter((specifier): specifier is string =>
  Boolean(specifier)
);

const resolveInternalImport = (
  fromFile: string,
  specifier: string
): string | null => {
  let basePath: string | null = null;

  if (specifier.startsWith('.')) {
    basePath = resolve(
      dirname(fromFile),
      specifier
    );
  } else if (
    specifier.startsWith(
      '@features/produccion-online/'
    )
  ) {
    basePath = resolve(
      PRODUCCION_ONLINE_ROOT,
      specifier.slice(
        '@features/produccion-online/'.length
      )
    );
  }

  if (!basePath) {
    return null;
  }

  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    join(basePath, 'index.ts'),
    join(basePath, 'index.tsx'),
  ];

  return (
    candidates.find(
      (candidate) =>
        existsSync(candidate) &&
        statSync(candidate).isFile() &&
        /\.tsx?$/.test(candidate)
    ) ?? null
  );
};

const findCircularImportPath = (
  files: readonly string[]
): string[] | null => {
  const sourceFileSet = new Set(files);
  const graph = new Map<string, string[]>();

  files.forEach((file) => {
    const dependencies =
      extractImportSpecifiers(
        readFileSync(file, 'utf8')
      )
        .map((specifier) =>
          resolveInternalImport(
            file,
            specifier
          )
        )
        .filter(
          (dependency): dependency is string =>
            dependency !== null &&
            sourceFileSet.has(dependency)
        );

    graph.set(file, dependencies);
  });

  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];

  const visit = (
    file: string
  ): string[] | null => {
    if (active.has(file)) {
      const cycleStart = stack.indexOf(file);

      return [
        ...stack.slice(cycleStart),
        file,
      ];
    }

    if (visited.has(file)) {
      return null;
    }

    active.add(file);
    stack.push(file);

    for (const dependency of graph.get(file) ?? []) {
      const cycle = visit(dependency);

      if (cycle) {
        return cycle;
      }
    }

    stack.pop();
    active.delete(file);
    visited.add(file);

    return null;
  };

  for (const file of files) {
    const cycle = visit(file);

    if (cycle) {
      return cycle;
    }
  }

  return null;
};

const findFilesContainingAny = (
  files: readonly string[],
  tokens: readonly string[]
): string[] =>
  files
    .filter((file) => {
      const source = readFileSync(
        file,
        'utf8'
      );

      return tokens.some((token) =>
        source.includes(token)
      );
    })
    .map((file) =>
      relative(
        PRODUCCION_ONLINE_ROOT,
        file
      )
    );

const findExternalDeepImports = (
  files: readonly string[]
): string[] =>
  files.flatMap((file) => {
    const specifiers = extractImportSpecifiers(
      readFileSync(file, 'utf8')
    );

    return specifiers
      .filter((specifier) => {
        if (
          specifier.startsWith(
            '@features/produccion-online/'
          )
        ) {
          return !PUBLIC_ENTRYPOINTS.has(
            specifier
          );
        }

        return specifier.includes(
          'features/produccion-online/'
        );
      })
      .map(
        (specifier) =>
          `${relative(SRC_ROOT, file)} -> ${specifier}`
      );
  });

export const suite = defineSuite(
  'produccion-online architecture boundaries',
  [
    test(
      'produccion-online no contiene dependencias circulares internas',
      () => {
        const sourceFiles = listSourceFiles(
          PRODUCCION_ONLINE_ROOT
        );
        const cycle = findCircularImportPath(
          sourceFiles
        );
        const readableCycle = cycle?.map(
          (file) =>
            relative(
              PRODUCCION_ONLINE_ROOT,
              file
            )
        );

        assert.equal(
          cycle,
          null,
          `Dependencia circular detectada: ${readableCycle?.join(' -> ') ?? ''}`
        );
      }
    ),
    test(
      'consumidores externos usan solo el entrypoint público de navegación',
      () => {
        const externalFiles = listSourceFiles(
          SRC_ROOT
        ).filter((file) =>
          relative(
            PRODUCCION_ONLINE_ROOT,
            file
          ).startsWith('..')
        );
        const violations =
          findExternalDeepImports(
            externalFiles
          );

        assert.deepEqual(
          violations,
          [],
          `Hay imports profundos hacia Producción Online: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'la capa api no depende de React ni presentación',
      () => {
        const violations =
          findFilesContainingAny(
            listSourceFiles(
              join(
                PRODUCCION_ONLINE_ROOT,
                'api'
              )
            ),
            [
              "from 'react'",
              '/components/',
              '../components/',
              '/hooks/',
              '../hooks/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `API depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application y mappers permanecen libres de React y componentes',
      () => {
        const files = [
          ...listSourceFiles(
            join(
              PRODUCCION_ONLINE_ROOT,
              'application'
            )
          ),
          ...listSourceFiles(
            join(
              PRODUCCION_ONLINE_ROOT,
              'mappers'
            )
          ),
        ];
        const violations =
          findFilesContainingAny(
            files,
            [
              "from 'react'",
              '/components/',
              '../components/',
              '/hooks/',
              '../hooks/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Application/mappers dependen de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'los componentes no consumen el api directamente',
      () => {
        const violations =
          findFilesContainingAny(
            listSourceFiles(
              join(
                PRODUCCION_ONLINE_ROOT,
                'components'
              )
            ),
            [
              '../api/',
              '/api/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Componentes consumen API directamente: ${violations.join(', ')}`
        );
      }
    ),
  ]
);
