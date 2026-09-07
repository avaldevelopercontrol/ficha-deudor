import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

const root = process.cwd();
const featureRoot = path.join(
  root,
  'src/features/gestion-cobranzas/modules/gestion-deudor'
);

const readText = (relativePath: string) =>
  fs.readFile(path.join(root, relativePath), 'utf8');

const collectProductSourceFiles = async (
  directory: string
): Promise<string[]> => {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (
          ['api', 'mappers', 'validations'].includes(
            entry.name
          )
        ) {
          return [];
        }

        return collectProductSourceFiles(absolutePath);
      }

      if (
        !/\.(ts|tsx)$/.test(entry.name) ||
        /\.test\.(ts|tsx)$/.test(entry.name)
      ) {
        return [];
      }

      return [absolutePath];
    })
  );

  return files.flat();
};

export const suite = defineSuite(
  'arquitectura final de Gestión Deudor',
  [
    test(
      'mantiene el contrato crudo del backend fuera de React y del modelo de dominio',
      async () => {
        const forbiddenBackendNames = [
          'nId_PersDeudor',
          'nId_Cliente',
          'nId_Contrato',
          'nId_Cartera',
          'zonaCampanna',
          'fechaUltimaGestionCALL',
          'ultimaGestionCALL',
          'cantidadGestionCALL',
          'fechaUltimaGestionCAMPO',
          'ultimaGestionCAMPO',
          'cantidadGestionCAMPO',
        ];
        const sourceFiles =
          await collectProductSourceFiles(featureRoot);

        for (const sourceFile of sourceFiles) {
          const source = await fs.readFile(
            sourceFile,
            'utf8'
          );

          for (const backendName of forbiddenBackendNames) {
            assert.equal(
              source.includes(backendName),
              false,
              `${path.relative(root, sourceFile)} no debe depender de ${backendName}`
            );
          }
        }
      }
    ),
    test(
      'mantiene Gestión Deudor como submódulo de Gestión de cobranzas',
      async () => {
        const legacyFeaturePath = path.join(
          root,
          'src/features/gestion-deudor'
        );
        const legacyStats = await fs
          .stat(legacyFeaturePath)
          .catch(() => null);

        assert.equal(legacyStats, null);

        const routes = await readText(
          'src/features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants.ts'
        );

        assert.match(
          routes,
          /GESTION_DEUDOR:\s*['"]\/gestion-cobranzas\/gestion-deudor['"]/m
        );
      }
    ),
    test(
      'mantiene la ruta de Gestión Deudor fuera de Auth',
      async () => {
        const authRoutes = await readText(
          'src/features/auth/constants/authRoutes.constants.ts'
        );

        assert.equal(
          authRoutes.includes('GESTION_DEUDOR'),
          false
        );
        assert.equal(
          authRoutes.includes(
            '/gestion-cobranzas/gestion-deudor'
          ),
          false
        );
      }
    ),
    test(
      'mantiene el CSS específico fuera del bundle global y bajo ownership de la página lazy',
      async () => {
        const globalStyles = await readText(
          'src/shared/styles/index.css'
        );
        const pageSource = await readText(
          'src/features/gestion-cobranzas/modules/gestion-deudor/pages/GestionDeudorPage.tsx'
        );

        assert.equal(
          globalStyles.includes('22-gestion-deudor.css'),
          false
        );
        assert.match(
          pageSource,
          /import ['"]\.\.\/styles\/22-gestion-deudor\.css['"];/
        );
      }
    ),
  ]
);
