import type {
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PromesasCarteraVenceHoyQuery,
  PromesasCarteraVencidasQuery,
  SeguimientoPromesasCarteraQuery,
} from '../domain/promesasCartera.types';
import {
  buildInicializacionCarteraEndpoint,
  buildPanoramaCarteraEndpoint,
  buildPromesasCarteraVenceHoyEndpoint,
  buildPromesasCarteraVencidasEndpoint,
  buildRendimientoAsesorCarteraEndpoint,
  buildRendimientoSupervisorCarteraEndpoint,
  buildSeguimientoPromesasCarteraEndpoint,
} from './centroControlCarteraApi.endpoints';
import {
  normalizarInicializacionCarteraTransporte,
  normalizarPanoramaCarteraTransporte,
  normalizarPromesasVenceHoyTransporte,
  normalizarPromesasVencidasTransporte,
  normalizarRendimientoAsesorTransporte,
  normalizarRendimientoSupervisorTransporte,
  normalizarSeguimientoPromesasTransporte,
} from './centroControlCarteraApi.normalizer';
import {
  fetchValidatedCentroControlCarteraResponse,
} from './centroControlCarteraApi.transport';
import type {
  InicializacionCarteraApiResponse,
  PanoramaCarteraApiResponse,
  PromesasCarteraVenceHoyApiResponse,
  PromesasCarteraVencidasApiResponse,
  RendimientoAsesorCarteraApiResponse,
  RendimientoSupervisorCarteraApiResponse,
  SeguimientoPromesasCarteraApiResponse,
} from './centroControlCarteraApi.types';
import {
  parseInicializacionCarteraApiResponse,
  parsePanoramaCarteraApiResponse,
  parsePromesasCarteraVenceHoyApiResponse,
  parsePromesasCarteraVencidasApiResponse,
  parseRendimientoAsesorCarteraApiResponse,
  parseRendimientoSupervisorCarteraApiResponse,
  parseSeguimientoPromesasCarteraApiResponse,
} from './centroControlCarteraApi.validators';

export {
  buildInicializacionCarteraEndpoint,
  buildPanoramaCarteraEndpoint,
  buildPromesasCarteraVenceHoyEndpoint,
  buildPromesasCarteraVencidasEndpoint,
  buildRendimientoAsesorCarteraEndpoint,
  buildRendimientoSupervisorCarteraEndpoint,
  buildSeguimientoPromesasCarteraEndpoint,
} from './centroControlCarteraApi.endpoints';

type PromiseOperationalContext = Pick<
  PortfolioOperationalContext,
  'businessUnit' | 'campaignId' | 'subPortfolioId'
>;

export const fetchCentroControlCarteraBootstrap = (
  crmClientId: number,
  filters: CentroControlCarteraFilters,
  signal: AbortSignal
): Promise<InicializacionCarteraApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildInicializacionCarteraEndpoint(filters),
    signal,
    normalizarInicializacionCarteraTransporte,
    parseInicializacionCarteraApiResponse
  );

export const fetchCentroControlCarteraOverview = (
  crmClientId: number,
  filters: CentroControlCarteraFilters,
  signal: AbortSignal
): Promise<PanoramaCarteraApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildPanoramaCarteraEndpoint(filters),
    signal,
    normalizarPanoramaCarteraTransporte,
    parsePanoramaCarteraApiResponse
  );

export const fetchPromesasCarteraVencidas = (
  crmClientId: number,
  context: PromiseOperationalContext,
  query: PromesasCarteraVencidasQuery,
  signal: AbortSignal
): Promise<PromesasCarteraVencidasApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildPromesasCarteraVencidasEndpoint(context, query),
    signal,
    normalizarPromesasVencidasTransporte,
    parsePromesasCarteraVencidasApiResponse
  );

export const fetchPromesasCarteraVenceHoy = (
  crmClientId: number,
  context: PromiseOperationalContext,
  query: PromesasCarteraVenceHoyQuery,
  signal: AbortSignal
): Promise<PromesasCarteraVenceHoyApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildPromesasCarteraVenceHoyEndpoint(context, query),
    signal,
    normalizarPromesasVenceHoyTransporte,
    parsePromesasCarteraVenceHoyApiResponse
  );

export const fetchSeguimientoPromesasCartera = (
  crmClientId: number,
  context: PromiseOperationalContext,
  query: SeguimientoPromesasCarteraQuery,
  signal: AbortSignal
): Promise<SeguimientoPromesasCarteraApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildSeguimientoPromesasCarteraEndpoint(context, query),
    signal,
    normalizarSeguimientoPromesasTransporte,
    parseSeguimientoPromesasCarteraApiResponse
  );

export const fetchRendimientoSupervisorCartera = (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<RendimientoSupervisorCarteraApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildRendimientoSupervisorCarteraEndpoint(context),
    signal,
    normalizarRendimientoSupervisorTransporte,
    parseRendimientoSupervisorCarteraApiResponse
  );

export const fetchRendimientoAsesorCartera = (
  crmClientId: number,
  context: PortfolioOperationalContext,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<RendimientoAsesorCarteraApiResponse> =>
  fetchValidatedCentroControlCarteraResponse(
    crmClientId,
    buildRendimientoAsesorCarteraEndpoint(context, supervisorId),
    signal,
    normalizarRendimientoAsesorTransporte,
    parseRendimientoAsesorCarteraApiResponse
  );
