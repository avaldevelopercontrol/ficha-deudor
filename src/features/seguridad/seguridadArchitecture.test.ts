import assert from 'node:assert/strict';
import {
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {
  fileURLToPath,
} from 'node:url';
import {
  dirname,
  join,
  relative,
} from 'node:path';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

const SEGURIDAD_ROOT = dirname(
  fileURLToPath(import.meta.url)
);

const listSourceFiles = (
  directory: string
): string[] =>
  readdirSync(directory).flatMap((name) => {
    const absolutePath = join(
      directory,
      name
    );

    if (statSync(absolutePath).isDirectory()) {
      return listSourceFiles(
        absolutePath
      );
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
        SEGURIDAD_ROOT,
        file
      )
    );

export const suite = defineSuite(
  'seguridad architecture boundaries',
  [
    test(
      'api y mappers no dependen de módulos de presentación',
      () => {
        const infrastructureFiles = [
          ...listSourceFiles(
            join(SEGURIDAD_ROOT, 'api')
          ),
          ...listSourceFiles(
            join(SEGURIDAD_ROOT, 'mappers')
          ),
        ];

        const violations =
          findFilesContainingAny(
            infrastructureFiles,
            [
              'modules/',
              'components/',
              'pages/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `Dependencias invertidas detectadas: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'accesos por usuario no depende de accesos por perfil',
      () => {
        const usuarioAccessFiles =
          listSourceFiles(
            join(
              SEGURIDAD_ROOT,
              'modules',
              'mantener-accesos-usuario'
            )
          );

        const violations =
          findFilesContainingAny(
            usuarioAccessFiles,
            ['mantener-accesos-perfil']
          );

        assert.deepEqual(
          violations,
          [],
          `Acoplamiento entre módulos detectado: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'domain no depende de capas de presentación',
      () => {
        const domainFiles =
          listSourceFiles(
            join(SEGURIDAD_ROOT, 'domain')
          );

        const violations =
          findFilesContainingAny(
            domainFiles,
            [
              'modules/',
              'components/',
              'pages/',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `El dominio depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'los componentes compartidos de accesos no dependen de modules',
      () => {
        const sharedAccessComponents =
          listSourceFiles(
            join(
              SEGURIDAD_ROOT,
              'components',
              'access'
            )
          );

        const violations =
          findFilesContainingAny(
            sharedAccessComponents,
            ['modules/']
          );

        assert.deepEqual(
          violations,
          [],
          `Los componentes compartidos dependen de un módulo concreto: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application coordina casos de uso sin depender de React ni de presentación',
      () => {
        const applicationFiles =
          listSourceFiles(
            join(SEGURIDAD_ROOT, 'application')
          );

        const violations =
          findFilesContainingAny(
            applicationFiles,
            [
              'modules/',
              'components/',
              'pages/',
              'hooks/',
              "from 'react'",
              'from "react"',
            ]
          );

        assert.deepEqual(
          violations,
          [],
          `La capa application depende de React o presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'los hooks compartidos de seguridad no dependen de módulos funcionales concretos',
      () => {
        const sharedHooks = listSourceFiles(
          join(SEGURIDAD_ROOT, 'hooks')
        );

        const violations =
          findFilesContainingAny(
            sharedHooks,
            ['modules/']
          );

        assert.deepEqual(
          violations,
          [],
          `Los hooks compartidos dependen de un módulo concreto: ${violations.join(', ')}`
        );
      }
    ),
  ]
);
