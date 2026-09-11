import type {
  AnalyticsPowerBiClientSelectionStatus,
} from '../domain/analyticsAccess.types';

export interface AnalyticsOptionClientDto {
  clientId: number;
  name: string;
}

export interface AnalyticsOptionClientsDto {
  optionId?: number;
  clientIds?: number[];
  clients?: AnalyticsOptionClientDto[];
}

export interface AnalyticsReportClientDto {
  clientId: number;
  name: string;
}

export interface AnalyticsReportClientsDto {
  optionId: number;
  clients: AnalyticsReportClientDto[];
}

export interface AnalyticsPowerBiOptionAccessDto {
  optionId: number;
  allowed: boolean;
  requiresClientSelection: boolean;
}

export interface AnalyticsPowerBiAccessDto {
  options: AnalyticsPowerBiOptionAccessDto[];
}

export interface AnalyticsPowerBiViewerContextDto {
  optionId: number;
  allowed: boolean;
  requiresClientSelection: boolean;
  clientSelectionStatus: AnalyticsPowerBiClientSelectionStatus;
  selectedClient: AnalyticsReportClientDto | null;
  embedUrl: string | null;
}
