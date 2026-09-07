import {
  useEffect,
  type ReactNode,
} from 'react';

import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  useAccessControl,
} from '@features/access-control';

import {
  useAppLayout,
} from '@shared/components/layout/AppLayoutContext';

import {
  REPORTERIA_ROUTES,
} from '../constants/reporteriaRoutes.constants';

import {
  usePowerBiViewerAccess,
} from '../modules/reporteria/hooks/usePowerBiViewerAccess';

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

  const [searchParams] = useSearchParams();

  const {
    status,
    menuTree,
  } = useAccessControl();

  const {
    setHeaderActions,
  } = useAppLayout();

  const routeSearch = searchParams.toString();

  const {
    reporteriaName,
    report,
    isValidReport,
    analyticsAccess,
    isAnalyticsAccessLoading,
    baseEmbedUrl,
    requiresScopedEmbed,
    rawScopedEmbedUrl,
    embedUrl,
  } = usePowerBiViewerAccess({
    optionIdParam,
    routeSearch,
    status,
    menuTree,
  });

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

  if (isAnalyticsAccessLoading) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        Validando acceso al reporte...
      </main>
    );
  }

  if (analyticsAccess?.status === 'error') {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          No se pudo validar el acceso Analytics
        </strong>
        <p>
          Reintenta desde Reportería.
        </p>
      </main>
    );
  }

  if (
    analyticsAccess?.status === 'ready' &&
    !analyticsAccess.allowed
  ) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          Reporte no disponible
        </strong>
        <p>
          No tienes el grupo requerido para consultar este reporte.
        </p>
      </main>
    );
  }

  if (
    analyticsAccess?.status === 'ready' &&
    analyticsAccess.clientSelectionStatus ===
      'MISSING'
  ) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          Selecciona una cartera
        </strong>
        <p>
          Este reporte requiere una cartera autorizada antes de abrirse.
        </p>
        <Link
          to={REPORTERIA_ROUTES.ROOT}
          className="reporteria-viewer__state-action"
        >
          Volver a Reportería
        </Link>
      </main>
    );
  }

  if (
    analyticsAccess?.status === 'ready' &&
    analyticsAccess.clientSelectionStatus ===
      'INVALID'
  ) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          Cartera no autorizada
        </strong>
        <p>
          La cartera seleccionada ya no está disponible para tu usuario o no corresponde a este reporte.
        </p>
        <Link
          to={REPORTERIA_ROUTES.ROOT}
          className="reporteria-viewer__state-action"
        >
          Seleccionar otra cartera
        </Link>
      </main>
    );
  }

  if (
    !requiresScopedEmbed &&
    !baseEmbedUrl
  ) {
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

  if (
    requiresScopedEmbed &&
    !rawScopedEmbedUrl
  ) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          Publicación no configurada
        </strong>
        <p>
          Esta cartera todavía no tiene una URL Publish to web asignada para este reporte.
        </p>
        <Link
          to={REPORTERIA_ROUTES.ROOT}
          className="reporteria-viewer__state-action"
        >
          Seleccionar otra cartera
        </Link>
      </main>
    );
  }

  if (!embedUrl) {
    return (
      <main className="reporteria-viewer reporteria-viewer--state">
        <strong>
          URL Publish to web no válida
        </strong>
        <p>
          La publicación configurada para esta cartera no corresponde a una URL válida de Power BI.
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
          referrerPolicy="no-referrer"
        />
      </div>
    </main>
  );
};

export default PowerBiViewerPage;
