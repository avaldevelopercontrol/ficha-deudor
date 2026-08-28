export interface InfDeudorCabeceraApi {
  [key: `cNombre_Param${string}`]:
    | string
    | null
    | undefined;
}

export interface InfDeudorParamApi {
  [key: `cPersInf_Param${string}`]:
    | string
    | null
    | undefined;
}

export interface InfDeudorTableRow {
  id: string;
  tipo: string;
  [key: string]: string;
}