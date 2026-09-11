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
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

const ANALYTICS_ROOT = dirname(
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
        ANALYTICS_ROOT,
        file
      )
    );

export const suite = defineSuite(
  'analytics architecture boundaries',
  [
    test(
      'reporteria solo conoce access-control a través de su adapter',
      () => {
        const reporteriaRoot = join(
          ANALYTICS_ROOT,
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
      'el dominio de reporteria no depende de React, APIs ni presentación',
      () => {
        const domainFiles = listSourceFiles(
          join(
            ANALYTICS_ROOT,
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
      'el dominio de portfolio no depende de React, API ni presentación',
      () => {
        const domainFiles = listSourceFiles(
          join(
            ANALYTICS_ROOT,
            'modules',
            'portfolio-control-center',
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
          `El dominio de Portfolio depende de infraestructura o presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'application de access no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            ANALYTICS_ROOT,
            'access',
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
            ANALYTICS_ROOT,
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
            ANALYTICS_ROOT,
            'access',
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
            ANALYTICS_ROOT,
            'modules',
            'reporteria',
            'hooks'
          )
        );

        const violations =
          findFilesContainingAny(
            hookFiles,
            [
              'access/api/analyticsAccess.api',
              'access/services/',
              'access/store/',
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
      'application de portfolio no depende de React ni presentación',
      () => {
        const applicationFiles = listSourceFiles(
          join(
            ANALYTICS_ROOT,
            'modules',
            'portfolio-control-center',
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
          `Application de Portfolio depende de presentación: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'hooks de portfolio consumen application y no API, mappers o services directamente',
      () => {
        const hookFiles = listSourceFiles(
          join(
            ANALYTICS_ROOT,
            'modules',
            'portfolio-control-center',
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
          `Hooks de Portfolio dependen directamente de infraestructura: ${violations.join(', ')}`
        );
      }
    ),
    test(
      'analytics no vuelve a depender ni recrear el antiguo archivo monolítico de tipos de portfolio',
      () => {
        const legacyTypesFile = join(
          ANALYTICS_ROOT,
          'types',
          'portfolioControlCenter.types.ts'
        );
        const sourceFiles =
          listSourceFiles(ANALYTICS_ROOT);

        const violations =
          findFilesContainingAny(
            sourceFiles,
            [
              'types/portfolioControlCenter.types',
              'portfolioControlCenter.types',
            ]
          );

        assert.equal(
          existsSync(legacyTypesFile),
          false,
          'El archivo legacy portfolioControlCenter.types.ts no debe volver a existir'
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
