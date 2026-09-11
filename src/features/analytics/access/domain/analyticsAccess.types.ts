export interface AnalyticsScope {
  crmClientId: number;
  name: string;
}

export interface AnalyticsReportClientOption {
  clientId: number;
  name: string;
}

export interface AnalyticsPowerBiOptionAccess {
  optionId: number;
  allowed: boolean;
  requiresClientSelection: boolean;
}

export type AnalyticsPowerBiClientSelectionStatus =
  | 'NOT_REQUIRED'
  | 'VALID'
  | 'MISSING'
  | 'INVALID';

export interface AnalyticsPowerBiViewerContext {
  optionId: number;
  allowed: boolean;
  requiresClientSelection: boolean;
  clientSelectionStatus: AnalyticsPowerBiClientSelectionStatus;
  selectedClient: AnalyticsReportClientOption | null;
  embedUrl: string | null;
}

export interface AnalyticsAccessContext {
  scopes: AnalyticsScope[];
}
