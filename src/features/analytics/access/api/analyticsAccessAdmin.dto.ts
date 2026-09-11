import type {
  AnalyticsReportClientGroupResolution,
} from '../domain/analyticsAccessAdmin.types';

export interface AnalyticsReportClientGroupOptionDto {
  groupId: number;
  name: string;
}

export interface AnalyticsOptionReportClientPublicationDto {
  clientId: number;
  name: string;
  isAvailable: boolean;
  groupResolution: AnalyticsReportClientGroupResolution;
  hasExplicitGroupConfiguration: boolean;
  groupIds: number[];
  candidateGroups: AnalyticsReportClientGroupOptionDto[];
  embedUrl: string | null;
  isReady: boolean;
}

export interface AnalyticsPowerBiConfigurationGroupDto {
  groupId: number;
  clientId: number;
  name: string;
}

export interface AnalyticsPowerBiConfigurationDto {
  optionId: number;
  isConfigured: boolean;
  groupIds: number[];
  availableGroups: AnalyticsPowerBiConfigurationGroupDto[];
  clients: AnalyticsOptionReportClientPublicationDto[];
}
