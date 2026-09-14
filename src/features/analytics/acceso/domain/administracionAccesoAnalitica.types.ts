export type AnalyticsReportClientGroupResolution =
  | 'CONFIGURED'
  | 'AUTO_DETECTED'
  | 'AMBIGUOUS'
  | 'MISSING'
  | 'INVALID_CONFIGURED'
  | 'UNAVAILABLE';

export interface AnalyticsReportClientGroupOption {
  groupId: number;
  name: string;
}

export interface AnalyticsOptionReportClientPublication {
  clientId: number;
  name: string;
  isAvailable: boolean;
  groupResolution: AnalyticsReportClientGroupResolution;
  hasExplicitGroupConfiguration: boolean;
  groupIds: number[];
  candidateGroups: AnalyticsReportClientGroupOption[];
  embedUrl: string | null;
  isReady: boolean;
}

export interface AnalyticsReportClientPublicationInput {
  clientId: number;
  name: string;
  /** null preserves the current backend group-resolution mode. */
  groupIds: readonly number[] | null;
  embedUrl: string;
}

export interface AnalyticsPowerBiConfigurationGroup {
  groupId: number;
  clientId: number;
  name: string;
}

export interface AnalyticsPowerBiConfiguration {
  optionId: number;
  isConfigured: boolean;
  groupIds: number[];
  availableGroups: AnalyticsPowerBiConfigurationGroup[];
  clients: AnalyticsOptionReportClientPublication[];
}

export interface SyncAnalyticsOptionInput {
  optionId: number;
  optionCode: string;
  optionName: string;
  isActive: boolean;
  groupIds: readonly number[];
}

export interface SyncAnalyticsPowerBiConfigurationInput
  extends SyncAnalyticsOptionInput {
  publications?: readonly AnalyticsReportClientPublicationInput[];
}
