import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import {
  APPLICATION_OPTION_IDS,
  useAccessControl,
} from '@features/access-control';

import {
  useAppLayout,
} from '@shared/components/layout/AppLayoutContext';

import {
  getAnalyticsOptionGroupAccess,
  getAnalyticsReportClientEmbed,
  getAnalyticsReportClients,
} from '../access/api/analyticsAccess.api';

import type {
  AnalyticsReportClientOption,
} from '../access/types/analyticsAccess.types';


import {
  REPORTERIA_ROUTES,
} from '../constants/reporteriaRoutes.constants';

import {
  findAuthorizedOptionById,
  resolvePowerBiEmbedUrl,
  resolvePowerBiPublishToWebUrl,
} from '../modules/reporteria/utils/reporteria.utils';

import {
  findAuthorizedReportClient,
  parseReportClientSelection,
} from '../modules/reporteria/utils/reporteriaClientScope.utils';

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

type ClientSelectionStatus =
  | 'NOT_REQUIRED'
  | 'VALID'
  | 'MISSING'
  | 'INVALID';

type ViewerAnalyticsAccessState =
  | {
      key: string;
      status: 'error';
    }
  | {
      key: string;
      status: 'ready';
      allowed: boolean;
      clientSelectionStatus: ClientSelectionStatus;
      selectedClient: AnalyticsReportClientOption | null;
      scopedEmbedUrl: string | null;
    };

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

  const optionId = Number(
    optionIdParam
  );
  const routeSearch = searchParams.toString();
  const accessRequestKey = `${optionId}:${routeSearch}`;

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

  const [
    analyticsAccess,
    setAnalyticsAccess,
  ] = useState<ViewerAnalyticsAccessState | null>(
    null
  );

  useEffect(() => {
    if (
      status !== 'ready' ||
      !isValidReport ||
      !Number.isSafeInteger(optionId) ||
      optionId <= 0
    ) {
      return;
    }

    let active = true;
    const controller =
      new AbortController();

    void (async () => {
      try {
        const access =
          await getAnalyticsOptionGroupAccess(
            optionId
          );

        if (!active) {
          return;
        }

        if (!access.allowed) {
          setAnalyticsAccess({
            key: accessRequestKey,
            status: 'ready',
            allowed: false,
            clientSelectionStatus:
              'NOT_REQUIRED',
            selectedClient: null,
            scopedEmbedUrl: null,
          });
          return;
        }

        const requiresClientSelection =
          access.requiresClientSelection;

        if (!requiresClientSelection) {
          setAnalyticsAccess({
            key: accessRequestKey,
            status: 'ready',
            allowed: true,
            clientSelectionStatus:
              'NOT_REQUIRED',
            selectedClient: null,
            scopedEmbedUrl: null,
          });
          return;
        }

        const requestedClient =
          parseReportClientSelection(
            new URLSearchParams(routeSearch)
          );

        if (!requestedClient) {
          setAnalyticsAccess({
            key: accessRequestKey,
            status: 'ready',
            allowed: true,
            clientSelectionStatus: 'MISSING',
            selectedClient: null,
            scopedEmbedUrl: null,
          });
          return;
        }

        const authorizedClients =
          await getAnalyticsReportClients(
            optionId,
            controller.signal
          );

        if (!active) {
          return;
        }

        const selectedClient =
          findAuthorizedReportClient(
            authorizedClients,
            requestedClient
          );

        if (!selectedClient) {
          setAnalyticsAccess({
            key: accessRequestKey,
            status: 'ready',
            allowed: true,
            clientSelectionStatus: 'INVALID',
            selectedClient: null,
            scopedEmbedUrl: null,
          });
          return;
        }

        const scopedEmbedUrl =
          await getAnalyticsReportClientEmbed(
            optionId,
            selectedClient,
            controller.signal
          );

        if (!active) {
          return;
        }

        setAnalyticsAccess({
          key: accessRequestKey,
          status: 'ready',
          allowed: true,
          clientSelectionStatus: 'VALID',
          selectedClient,
          scopedEmbedUrl,
        });
      } catch {
        if (
          !active ||
          controller.signal.aborted
        ) {
          return;
        }

        setAnalyticsAccess({
          key: accessRequestKey,
          status: 'error',
        });
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    accessRequestKey,
    isValidReport,
    optionId,
    routeSearch,
    status,
  ]);

  const isAnalyticsAccessLoading =
    status === 'ready' &&
    isValidReport &&
    analyticsAccess?.key !==
      accessRequestKey;

  const baseEmbedUrl = isValidReport
    ? resolvePowerBiEmbedUrl(
        report?.urlBI ?? null
      )
    : null;

  const selectedClient =
    analyticsAccess?.status === 'ready'
      ? analyticsAccess.selectedClient
      : null;

  const requiresScopedEmbed =
    selectedClient !== null;

  const rawScopedEmbedUrl =
    analyticsAccess?.status === 'ready'
      ? analyticsAccess.scopedEmbedUrl
      : null;

  const scopedEmbedUrl =
    resolvePowerBiPublishToWebUrl(
      rawScopedEmbedUrl
    );

  const embedUrl = requiresScopedEmbed
    ? scopedEmbedUrl
    : baseEmbedUrl;

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

  if (
    analyticsAccess?.key ===
      accessRequestKey &&
    analyticsAccess.status === 'error'
  ) {
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
    analyticsAccess?.key ===
      accessRequestKey &&
    analyticsAccess.status === 'ready' &&
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
    analyticsAccess?.key ===
      accessRequestKey &&
    analyticsAccess.status === 'ready' &&
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
    analyticsAccess?.key ===
      accessRequestKey &&
    analyticsAccess.status === 'ready' &&
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
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </main>
  );
};

export default PowerBiViewerPage;
