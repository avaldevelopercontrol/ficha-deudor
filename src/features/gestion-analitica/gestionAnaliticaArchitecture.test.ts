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

const GESTION_ANALITICA_ROOT = dirname(
  fileURLToPath(import.meta.url)
);

const SRC_ROOT = dirname(
  dirname(GESTION_ANALITICA_ROOT)
);

const GESTION_ANALITICA_PUBLIC_ENTRYPOINTS = new Set([
  '@features/gestion-analitica/acceso',
  '@features/gestion-analitica/acceso/administracion',
  '@features/gestion-analitica/acceso/session',
  '@features/gestion-analitica/constants',
  '@features/gestion-analitica/navigation',
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
        GESTION_ANALITICA_ROOT,
        file
      )
    );

const findGestionAnaliticaDeepImports = (
  files: readonly string[]
): string[] => {
  const importPattern =
    /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;

  return files.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    const specifiers = Array.from(
      source.matchAll(importPattern),
      (match) => match[1]
    ).filter((specifier): specifier is string =>
      Boolean(specifier)
    );

    const invalidSpecifiers = specifiers.filter(
      (specifier) => {
        if (
          specifier.startsWith(
            '@features/gestion-analitica/'
          )
        ) {
          return !GESTION_ANALITICA_PUBLIC_ENTRYPOINTS.has(
            specifier
          );
        }

        return specifier.includes(
          'features/gestion-analitica/'
        );
      }
    );

    return invalidSpecifiers.map(
      (specifier) =>
        `${relative(SRC_ROOT, file)} -> ${specifier}`
    );
  });
};


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

const resolveGestionAnaliticaImport = (
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
      '@features/gestion-analitica/'
    )
  ) {
    basePath = resolve(
      GESTION_ANALITICA_ROOT,
      specifier.slice(
        '@features/gestion-analitica/'.length
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
    const source = readFileSync(file, 'utf8');
    const dependencies = extractImportSpecifiers(source)
      .map((specifier) =>
        resolveGestionAnaliticaImport(
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

export const suite = defineSuite(
  'gestion-analitica architecture boundaries',
  [
    test(
      'gestión analítica no contiene dependencias circulares internas',
      () => {
        const sourceFiles = listSourceFiles(
          GESTION_ANALITICA_ROOT
        );
        const cycle = findCircularImportPath(
          sourceFiles
        );
        const readableCycle = cycle?.map((file) =>
          relative(
            GESTION_ANALITICA_ROOT,
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
      'consumidores externos usan solo entrypoints públicos de gestión analítica',
      () => {
        const externalFiles = listSourceFiles(
          SRC_ROOT
        ).filter((file) =>
          relative(
            GESTION_ANALITICA_ROOT,
            file
          ).startsWith('..')
        );

        const violations =
          findGestionAnaliticaDeepImports(
            externalFiles
          );

        assert.deepEqual(
          violations,
          [],
          `Hay imports profundos hacia Gestión Analítica fuera de su API pública: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'reporteria solo conoce access-control a través de su adapter',
      () => {
        const reporteriaRoot = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'reporteria'
        );
        const reporteriaFiles =
          listSourceFiles(reporteriaRoot).filter(
            (file) =>
              !file.includes(
                `${join('reporteria', 'adapters')}`
              )
          );

        const violations =
          findFilesContainingAny(
            reporteriaFiles,
            ['@features/access-control']
          );

        assert.deepEqual(
          violations,
          [],
          `Reportería depende directamente de access-control fuera del adapter: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'reporteria solo consume el API concreto de acceso analitica desde su adapter',
      () => {
        const reporteriaRoot = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'reporteria'
        );
        const reporteriaFiles =
          listSourceFiles(reporteriaRoot).filter(
            (file) =>
              !file.includes(
                `${join('reporteria', 'adapters')}`
              )
          );

        const violations =
          findFilesContainingAny(
            reporteriaFiles,
            ['acceso/api/accesoAnalitica.api']
          );

        assert.deepEqual(
          violations,
          [],
          `Reportería depende directamente del API de Acceso Analítica fuera del adapter: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'componentes de centro-control-cartera no resuelven access-control directamente',
      () => {
        const componentFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'components'
          )
        );

        const violations =
          findFilesContainingAny(
            componentFiles,
            ['@features/access-control']
          );

        assert.deepEqual(
          violations,
          [],
          `Componentes de Centro de Control de Cartera dependen directamente de access-control: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'utilidades de AnalyticsSearchableSelect no dependen del componente React',
      () => {
        const utilityFile = join(
          GESTION_ANALITICA_ROOT,
          'shared',
          'components',
          'analyticsSearchableSelect.utils.ts'
        );
        const violations =
          findFilesContainingAny(
            [utilityFile],
            ['./AnalyticsSearchableSelect']
          );

        assert.deepEqual(
          violations,
          [],
          'Las utilidades de AnalyticsSearchableSelect no deben importar el componente React'
        );
      }
    ),
    test(
      'el dominio de reporteria no depende de React, APIs ni presentación',
      () => {
        const domainFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'reporteria',
            'domain'
          )
        );

        const violations =
          findFilesContainingAny(
            domainFiles,
            [
              "from 'react'",
              'components/',
              'hooks/',
              'pages/',
              '/api/',
              '@features/access-control',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `El dominio de Reportería depende de infraestructura o presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'el dominio de centro-control-cartera no depende de React, API ni presentación',
      () => {
        const domainFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'domain'
          )
        );

        const violations =
          findFilesContainingAny(
            domainFiles,
            [
              "from 'react'",
              'components/',
              'hooks/',
              'pages/',
              '/api/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `El dominio de Centro de Control de Cartera depende de infraestructura o presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application de access no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'acceso',
            'application'
          )
        );

        const violations =
          findFilesContainingAny(
            applicationFiles,
            [
              "from 'react'",
              'components/',
              'hooks/',
              'pages/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Application de Access depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application de reporteria no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'reporteria',
            'application'
          )
        );

        const violations =
          findFilesContainingAny(
            applicationFiles,
            [
              "from 'react'",
              'components/',
              'hooks/',
              'pages/',
              '../adapters/',
              'acceso/api/',
              '@features/access-control',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Application de Reportería depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'hooks de access consumen application y no infraestructura directamente',
      () => {
        const hookFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'acceso',
            'hooks'
          )
        );

        const violations =
          findFilesContainingAny(
            hookFiles,
            [
              "../api/",
              "../store/",
              "../services/",
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Hooks de Access dependen directamente de infraestructura: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'hooks de reporteria no consumen directamente APIs de access',
      () => {
        const hookFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'reporteria',
            'hooks'
          )
        );

        const violations =
          findFilesContainingAny(
            hookFiles,
            [
              'acceso/api/accesoAnalitica.api',
              'acceso/services/',
              'acceso/store/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Hooks de Reportería dependen directamente de infraestructura de Access: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application de centro-control-cartera no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'application'
          )
        );

        const violations = findFilesContainingAny(
          applicationFiles,
          [
            "from 'react'",
            'components/',
            'hooks/',
            'pages/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `Application de Centro de Control de Cartera depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'hooks de centro-control-cartera consumen application y no API, mappers o services directamente',
      () => {
        const hookFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'hooks'
          )
        );

        const violations = findFilesContainingAny(
          hookFiles,
          [
            '../api/',
            '../mappers/',
            '../services/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `Hooks de Centro de Control de Cartera dependen directamente de infraestructura: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'los builders de centro-control-cartera permanecen puros y sin transporte HTTP',
      () => {
        const endpointsFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'api',
          'centroControlCarteraApi.endpoints.ts'
        );

        const violations = findFilesContainingAny(
          [endpointsFile],
          [
            'analyticsApiClient',
            '.normalizer',
            '.validators',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          'Los builders de endpoints no deben conocer transporte ni parsing de respuestas'
        );
      }
    ),
    test(
      'el transporte de centro-control-cartera no conoce dominio ni contratos de respuesta',
      () => {
        const transportFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'api',
          'centroControlCarteraApi.transport.ts'
        );

        const violations = findFilesContainingAny(
          [transportFile],
          [
            '../domain/',
            '.normalizer',
            '.validators',
            '.types',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          'El transporte HTTP no debe conocer dominio, normalizadores ni contratos de respuesta'
        );
      }
    ),
    test(
      'la fachada API de centro-control-cartera no reconstruye URLs ni ejecuta HTTP directamente',
      () => {
        const facadeFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'api',
          'centroControlCarteraApi.ts'
        );

        const violations = findFilesContainingAny(
          [facadeFile],
          [
            'new URLSearchParams',
            'CENTRO_CONTROL_CARTERA_ENDPOINTS',
            'analyticsApiClient',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          'La fachada API debe limitarse a componer endpoint, transporte, normalización y parsing'
        );
      }
    ),
    test(
      'promesas vencidas carga el generador XLSX de forma diferida',
      () => {
        const exportHookFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'hooks',
          'usePromesasCarteraVencidasExport.ts'
        );
        const source = readFileSync(exportHookFile, 'utf8');

        assert.equal(
          source.includes(
            "from '../export/promesasCarteraVencidasExcel'"
          ),
          false,
          'El generador XLSX de vencidas no debe formar parte del import estático de la página'
        );
        assert.equal(
          source.includes(
            "import('../export/promesasCarteraVencidasExcel')"
          ),
          true,
          'El generador XLSX de vencidas debe cargarse bajo demanda al exportar'
        );
      }
    ),
    test(
      'seguimiento de promesas carga el generador XLSX de forma diferida',
      () => {
        const exportHookFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'hooks',
          'useSeguimientoPromesasCarteraExport.ts'
        );
        const source = readFileSync(exportHookFile, 'utf8');

        assert.equal(
          source.includes(
            "from '../export/seguimientoPromesasCarteraExcel'"
          ),
          false,
          'El generador XLSX no debe formar parte del import estático de la página'
        );
        assert.equal(
          source.includes(
            "import('../export/seguimientoPromesasCarteraExcel')"
          ),
          true,
          'El generador XLSX debe cargarse bajo demanda al iniciar la exportación'
        );
      }
    ),
    test(
      'el motor XLSX reutilizable no depende del dominio de cartera',
      () => {
        const xlsxEngineFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'export',
            'xlsx'
          )
        );
        const violations = findFilesContainingAny(
          xlsxEngineFiles,
          [
            '/domain/',
            '../domain/',
            'SeguimientoPromesa',
            'PortfolioOperationalContext',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `El motor XLSX no debe conocer el dominio de cartera: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'la fachada de exportación de promesas no implementa detalles ZIP',
      () => {
        const exportFacadeFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'export',
          'seguimientoPromesasCarteraExcel.ts'
        );
        const violations = findFilesContainingAny(
          [exportFacadeFile],
          [
            'CRC32_TABLE',
            'new DataView',
            'new TextEncoder',
            '0x04034b50',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          'La fachada del reporte debe delegar la construcción ZIP al motor XLSX'
        );
      }
    ),
    test(
      'el modal de seguimiento delega estado, consultas y exportación a su controller',
      () => {
        const modalFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'components',
          'SeguimientoPromesasCarteraModal.tsx'
        );
        const source = readFileSync(modalFile, 'utf8');
        const forbiddenImports = [
          "../hooks/useDetallePromesaCarteraTableState'",
          "../hooks/useSeguimientoPromesasCartera'",
          "../hooks/useSeguimientoPromesasCarteraExport'",
          "../hooks/useCentroControlCarteraPermissions'",
        ];

        const violations = forbiddenImports.filter((token) =>
          source.includes(token)
        );

        assert.deepEqual(
          violations,
          [],
          `El modal volvió a coordinar hooks de estado o datos directamente: ${violations.join(', ')}`
        );
        assert.equal(
          source.includes(
            '../hooks/useSeguimientoPromesasCarteraModalController'
          ),
          true,
          'El modal debe consumir su controller de presentación'
        );
      }
    ),
    test(
      'la página de centro-control-cartera delega la coordinación operativa a su controller',
      () => {
        const pageFile = join(
          GESTION_ANALITICA_ROOT,
          'pages',
          'CentroControlCarteraPage.tsx'
        );
        const source = readFileSync(pageFile, 'utf8');
        const forbiddenImports = [
          'useCentroControlCarteraBootstrap',
          'useAutoActualizacionCartera',
          'useRendimientoCarteraController',
          'resolveCentroControlCarteraViewState',
          'switchUnidadNegocioCartera',
        ];

        const violations = forbiddenImports.filter((token) =>
          source.includes(token)
        );

        assert.deepEqual(
          violations,
          [],
          `La página volvió a coordinar lógica operativa directamente: ${violations.join(', ')}`
        );
        assert.equal(
          source.includes('useCentroControlCarteraPageController'),
          true,
          'La página debe consumir el controller del Centro de Control de Cartera'
        );
      }
    ),
    test(
      'los controllers de presentación de cartera no dependen de componentes ni páginas',
      () => {
        const controllerFiles = [
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'hooks',
            'useCentroControlCarteraPageController.ts'
          ),
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'centro-control-cartera',
            'hooks',
            'useSeguimientoPromesasCarteraModalController.ts'
          ),
        ];
        const violations = findFilesContainingAny(
          controllerFiles,
          [
            '../components/',
            '/components/',
            '../pages/',
            '/pages/',
            '../../../acceso',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `Los controllers no deben depender de componentes o páginas: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'la definición de columnas de seguimiento permanece libre de consultas y estado remoto',
      () => {
        const columnsFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'centro-control-cartera',
          'components',
          'seguimientoPromesasCarteraColumns.tsx'
        );
        const violations = findFilesContainingAny(
          [columnsFile],
          [
            '../hooks/',
            '../application/',
            '../api/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          'Las columnas deben limitarse a configuración y presentación de celdas'
        );
      }
    ),
    test(
      'el dominio de sesiones BI no depende de React, API ni presentación',
      () => {
        const domainFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'sesiones-bi',
            'domain'
          )
        );

        const violations = findFilesContainingAny(
          domainFiles,
          [
            "from 'react'",
            'components/',
            'hooks/',
            'pages/',
            '/api/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `El dominio de Sesiones BI depende de infraestructura o presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application de sesiones BI no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'sesiones-bi',
            'application'
          )
        );

        const violations = findFilesContainingAny(
          applicationFiles,
          [
            "from 'react'",
            'components/',
            'hooks/',
            'pages/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `Application de Sesiones BI depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'hooks de sesiones BI consumen application y no infraestructura directamente',
      () => {
        const hookFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'sesiones-bi',
            'hooks'
          )
        );

        const violations = findFilesContainingAny(
          hookFiles,
          [
            '../api/',
            '../mappers/',
            '../services/',
          ]
        );

        assert.deepEqual(
          violations,
          [],
          `Hooks de Sesiones BI dependen directamente de infraestructura: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'sesiones BI no recrea el API monolítico previo',
      () => {
        const legacyApiFile = join(
          GESTION_ANALITICA_ROOT,
          'modules',
          'sesiones-bi',
          'api',
          'sesionesBi.api.ts'
        );
        const moduleFiles = listSourceFiles(
          join(
            GESTION_ANALITICA_ROOT,
            'modules',
            'sesiones-bi'
          )
        );
        const violations = findFilesContainingAny(
          moduleFiles,
          ['sesionesBi.api']
        );

        assert.equal(
          existsSync(legacyApiFile),
          false,
          'El archivo monolítico sesionesBi.api.ts no debe volver a existir'
        );
        assert.deepEqual(
          violations,
          [],
          `Imports legacy de Sesiones BI detectados: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'gestión analítica no vuelve a depender ni recrear el antiguo archivo monolítico de tipos de cartera',
      () => {
        const legacyTypesFile = join(
          GESTION_ANALITICA_ROOT,
          'types',
          'centroControlCartera.types.ts'
        );
        const sourceFiles =
          listSourceFiles(GESTION_ANALITICA_ROOT);

        const violations =
          findFilesContainingAny(
            sourceFiles,
            [
              'types/centroControlCartera.types',
              'centroControlCartera.types',
            ]
          );

        assert.equal(
          existsSync(legacyTypesFile),
          false,
          'El archivo legacy centroControlCartera.types.ts no debe volver a existir'
        );
        assert.deepEqual(
          violations,
          [],
          `Imports legacy de Portfolio detectados: ${violations.join(', ')}`
        );
      }
    ),
  ]
);
