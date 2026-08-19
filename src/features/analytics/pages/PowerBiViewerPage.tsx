import {
  useEffect,
  type ReactNode,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  APPLICATION_OPTION_IDS,
  useAccessControl,
} from '@features/access-control';

import {
  useAppLayout,
} from '@shared/components/layout/AppLayoutContext';

import {
  REPORTERIA_ROUTES,
} from '../constants/reporteriaRoutes.constants';

import {
  findAuthorizedOptionById,
  resolvePowerBiEmbedUrl,
} from '../modules/reporteria/utils/reporteria.utils';

import '../styles/33-reporteria.css';

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6" />
    <path d="M9 12h10" />
  </svg>
);

export const PowerBiViewerPage = (): ReactNode => {
  const {
    optionId: optionIdParam,
  } = useParams<{
    optionId: string;
  }>();

  const {
    status,
    menuTree,
  } = useAccessControl();

  const {
    setHeaderActions,
  } = useAppLayout();

  const optionId = Number(
    optionIdParam
  );

  const reporteria =
    findAuthorizedOptionById(
      menuTree,
      APPLICATION_OPTION_IDS.REPORTERIA
    );

  const reporteriaName =
    reporteria?.name || 'Reportería';

  useEffect(() => {
    setHeaderActions(
      <Link
        to={REPORTERIA_ROUTES.ROOT}
        className="reporteria-header-back"
        aria-label={`Volver a ${reporteriaName}`}
      >
        <BackIcon />
        <span>{`Volver a ${reporteriaName}`}</span>
      </Link>
    );

    return () => {
      setHeaderActions(null);
    };
  }, [
    reporteriaName,
    setHeaderActions,
  ]);

  const report =
    Number.isSafeInteger(optionId) &&
    optionId > 0
      ? findAuthorizedOptionById(
          menuTree,
          optionId
        )
      : null;

  const isValidReport = Boolean(
    report &&
    report.parentId ===
      APPLICATION_OPTION_IDS.REPORTERIA &&
    report.permissions.consultar
  );

  const embedUrl = isValidReport
    ? resolvePowerBiEmbedUrl(
        report?.urlBI ?? null
      )
    : null;

  if (
    status === 'idle' ||
    status === 'loading'
  ) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        Cargando reporte...
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          No se pudieron cargar los accesos
        </strong>
        <p>
          Reintenta desde Reportería.
        </p>
      </main>
    );
  }

  if (!isValidReport) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          Reporte no disponible
        </strong>
        <p>
          El reporte no existe o no tienes permiso para consultarlo.
        </p>
      </main>
    );
  }

  if (!embedUrl) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          URL de Power BI no válida
        </strong>
        <p>
          Revisa la configuración del reporte en Mantener módulo.
        </p>
      </main>
    );
  }

  return (
    <main className="reporteria-viewer">
      <div className="reporteria-viewer__frame-wrap">
        <iframe
          src={embedUrl}
          title={`Power BI - ${report?.name ?? 'Reporte'}`}
          className="reporteria-viewer__frame"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </main>
  );
};

export default PowerBiViewerPage;
