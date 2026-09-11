import type {
  SisgesIconName,
} from '@shared/icons/sisges';

export type ReporteriaAccessStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export interface PowerBiReport {
  id: number;
  code: string;
  name: string;
  description: string;
  serviceUrl: string | null;
  image: string | null;
  email: string | null;
  icon: SisgesIconName;
}

export interface ReporteriaSection {
  id: number;
  name: string;
  description: string;
  parentId: number;
}

export interface ReporteriaCatalog {
  section: ReporteriaSection | null;
  parentName: string | null;
  reports: readonly PowerBiReport[];
}
