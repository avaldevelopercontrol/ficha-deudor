export interface FichaDeudorParams {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
  fecha_inicio_gestion: string;
}

export type FichaDeudorParamKey = keyof FichaDeudorParams;

export type FichaDeudorRequiredParamKey = Exclude<
  FichaDeudorParamKey,
  'fecha_inicio_gestion'
>;

export type FichaDeudorIdentityParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_cartera' | 'id_deudor' | 'id_usuario'
>;

export type FichaDeudorHeaderParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_cartera' | 'id_deudor'
>;

export type FichaDeudorDocumentosParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_cartera' | 'id_deudor' | 'id_contrato' | 'id_usuario'
>;

export type FichaDeudorCarteraPanelParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_cartera' | 'id_deudor'
>;

export type FichaDeudorReferenciaPanelParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_deudor' | 'id_usuario'
>;

export type FichaDeudorGestionPanelParams = Pick<
  FichaDeudorParams,
  'id_cliente' | 'id_cartera' | 'id_deudor' | 'id_usuario'
>;

export type FichaDeudorGestionFormParams = Pick<
  FichaDeudorParams,
  | 'id_cliente'
  | 'id_cartera'
  | 'id_deudor'
  | 'id_contrato'
  | 'id_usuario'
  | 'fecha_inicio_gestion'
>;