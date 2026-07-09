export interface InfDeudorCabeceraApi {
  [key: `cNombre_Param${string}`]: string;
  bTipo_Cabecera?: boolean;
}

export interface InfDeudorParamApi {
  [key: `cPersInf_Param${string}`]: string;
}

export interface InfDeudorTableRow {
  id: string;
  tipo: string;
  [key: string]: string;
}