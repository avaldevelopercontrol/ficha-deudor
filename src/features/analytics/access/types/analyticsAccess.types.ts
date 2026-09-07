export interface AnalyticsScope {
  crmClientId: number;
  name: string;
}

export interface AnalyticsOptionClient {
  clientId: number;
  name: string;
}

export interface AnalyticsOptionClientsResponse {
  optionId?: number;
  clientIds?: number[];
  clients?: AnalyticsOptionClient[];
}

export interface AnalyticsReportClientOption {
  clientId: number;
  name: string;
}

export interface AnalyticsReportClientsResponse {
  optionId: number;
  clients: AnalyticsReportClientOption[];
}

export interface AnalyticsPowerBiOptionAccess {
  optionId: number;
  allowed: boolean;
  requiresClientSelection: boolean;
}

export interface AnalyticsPowerBiAccessResponse {
  options: AnalyticsPowerBiOptionAccess[];
}

export type AnalyticsPowerBiClientSelectionStatus =
  | 'NOT_REQUIRED'
  | 'VALID'
  | 'MISSING'
  | 'INVALID';

export interface AnalyticsPowerBiViewerContextResponse {
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
