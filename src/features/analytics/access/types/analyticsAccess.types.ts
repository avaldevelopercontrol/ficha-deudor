export type AnalyticsCoverageMode =
  | 'SINGLE'
  | 'MULTIPLE'
  | 'ALL';

export type AnalyticsScopePolicy =
  | 'USER_SCOPED'
  | 'UNRESTRICTED';

export type AnalyticsFilterStrategy =
  | 'NONE'
  | 'URL_FILTER'
  | 'EMBEDDED_RLS';

export interface AnalyticsScope {
  crmClientId: number;
  name: string;
}


export interface AnalyticsOptionClientsResponse {
  optionId: number;
  clientIds: number[];
}

export type AnalyticsGroupScopeMode =
  | 'GROUP'
  | 'CLIENT_LEGACY'
  | 'NONE';

export interface AnalyticsOptionGroupAccessResponse {
  optionId: number;
  allowed: boolean;
  scopeMode: AnalyticsGroupScopeMode;
  groupIds: number[];
  requiresClientSelection: boolean;
}

export interface AnalyticsReportClientOption {
  clientId: number;
  name: string;
}

export interface AnalyticsReportClientsResponse {
  optionId: number;
  clients: AnalyticsReportClientOption[];
}

export interface AnalyticsReportClientEmbedResponse {
  optionId: number;
  clientId: number;
  name: string;
  embedUrl: string;
}

export interface AnalyticsReportScope {
  crmClientId: number;
  filterValue: string | null;
}

export interface AnalyticsReportAccess {
  optionId: number;
  coverageMode: AnalyticsCoverageMode;
  scopePolicy: AnalyticsScopePolicy;
  filterStrategy: AnalyticsFilterStrategy;
  filterTable: string | null;
  filterColumn: string | null;
  allowedScopes: AnalyticsReportScope[];
}

export interface AnalyticsAccessContext {
  scopes: AnalyticsScope[];
  reports: AnalyticsReportAccess[];
}
