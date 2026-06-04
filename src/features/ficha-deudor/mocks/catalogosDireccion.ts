import type { SelectOption, Ubigeo } from '../../../shared/types';

export const refUbicacionDirOptions: SelectOption[] = [
  { id: 'CASA_DONDE_RESIDE', label: 'Casa donde reside' },
  { id: 'CASA_DE_FAMILIAR', label: 'Casa de familiar' },
  { id: 'CASA_DE_VECINO', label: 'Casa de Vecino' },
  { id: 'REFERENCIA_ZONAL', label: 'Referencia Zonal' },
  { id: 'EMPRESA_TRABAJO', label: 'Empresa / Trabajo' },
  { id: 'OTRO_NO_ESPECIFICADO', label: 'Otro No especificado' },
  { id: 'MOVIL_CELULAR', label: 'Movil / Celular' },
  { id: 'DIR_RECOJO_EQUIPO_DTV', label: 'Dir. Recojo Equipo DTV' },
  { id: 'DIR_SUNAT', label: 'Dir. SUNAT' },
  { id: 'DIR_INF_AVAL_PERU', label: 'Dir. Inf. Aval Perú' },
  { id: 'PACIFICO_3ER_PROPIETARIO', label: 'Pacífico 3er Propietario' },
  { id: 'PACIFICO_3ER_CONDUCTOR', label: 'Pacífico 3er Conductor' },
  { id: 'REFERENCIA_RECOMENDADA', label: 'Referencia Recomendada' },
  { id: 'MODEM_INTERNET', label: 'Modem / Internet' },
  { id: 'DIR_PAGINAS_BLANCAS', label: 'Dir. Paginas Blancas' },
  { id: 'DIRECTORA_UNIQUE', label: 'Directora - UNIQUE' },
  { id: 'DIR_COMERCIAL_VISANET', label: 'Dir. Comercial - VISA NET' },
  { id: 'DIR_ADMINISTRATIVA_VISANET', label: 'Dir. Administrativa - VISA NET' },
  { id: 'DIR_BUSQUEDA_VISANET', label: 'Dir. Búsqueda - VISA NET' },
  { id: 'EMPRESA_REPRESENTANTE_LEGAL', label: 'Empresa Representante Legal' },
  { id: 'EMPRESA_ADMINISTRADOR', label: 'Empresa Administrador' },
  { id: 'EMPRESA_CONTACTO', label: 'Empresa Contacto' },
  { id: 'DIRECCION_ENTREGA', label: 'Dirección de Entrega' },
  { id: 'DIRECCION_FACTURACION', label: 'Dirección de Facturación' },
  { id: 'DIRECCION_CONTRATACION', label: 'Dirección de Contratación' },
  { id: 'DIR_COMERCIAL_MASTERCARD', label: 'Dir. Comercial - MASTERCARD' },
  { id: 'LIDER_ORIFLAME', label: 'Líder - ORIFLAME' },
  { id: 'TELEFONO_SOCIO_ORIFLAME', label: 'Telefono de Socio - ORIFLAME' },
  { id: 'DIRECCION_EXPERIAN', label: 'Dirección EXPERIAN' },
  { id: 'DIR_ADMINISTRATIVA_MASTERCARD', label: 'Dir. Administrativa - MASTERCARD' },
  { id: 'DIR_CLARO_RECUPERO', label: 'Dir. - CLARO RECUPERO' },
  { id: 'REFERENCIAS_ORIFLAME', label: 'Referencias - ORIFLAME' },
  { id: 'DIRECCION_TITULAR', label: 'DIRECCIÓN TITULAR' },
  { id: 'DIRECCION_DEL_AVAL', label: 'DIRECCIÓN DEL AVAL' },
  { id: 'TELEFONOS_PROSEGUR', label: 'Teléfonos Prosegur' },
  { id: 'TELEFONOS_BITEL', label: 'Teléfonos BITEL' },
  { id: 'DIRECCION_TITULAR_BITEL', label: 'Dirección Titular Bitel' },
  { id: 'TELEFONOS_LA_POSITIVA', label: 'Teléfonos La Positiva' },
  { id: 'TELEFONOS_GMG', label: 'Teléfonos GMG' },
  { id: 'DIRECCION_GMG', label: 'Dirección GMG' },
  { id: 'TELEFONOS_UCAL_TLS', label: 'Teléfonos UCAL-TLS' },
  { id: 'DIRECCION_UCAL_TLS', label: 'Dirección UCAL-TLS' },
  { id: 'BUSQUEDA_CLARO_R_2018', label: 'Busqueda Claro_R 04-10-2018' },
  { id: 'LISTA_NEGRA_MAF', label: 'Lista Negra MAF' },
  { id: 'TEL_ADMINISTRATIVO_VISA_COB', label: 'Tel. Administrativo - VISA COB.' },
  { id: 'TEL_COMERCIAL_VISA_COB', label: 'Tel. Comercial - VISA COB.' },
  { id: 'TELEFONOS_CARRION', label: 'Teléfonos Carrión' },
  { id: 'DATOS_EQUIFAX', label: 'Datos Equifax' },
  { id: 'TELEFONOS_MAF', label: 'Teléfonos MAF' },
  { id: 'NECOMPLUS_DIRECCION', label: 'NECOMPLUS - DIRECCION' },
  { id: 'ORIFLAME_BUSQUEDA_SEARCH', label: 'Oriflame - Busqueda Search' },
  { id: 'EQUIFAX_DIR_SUNAT', label: 'EQUIFAX - Dirección Sunat' },
  { id: 'BUSQUEDA_SEARCH', label: 'Búsqueda Search' },
  { id: 'TELEFONOS_CIBERTEC', label: 'Teléfonos Cibertec' },
  { id: 'DIRECCION_CIBERTEC', label: 'Dirección Cibertec' },
  { id: 'BUSQUEDA_VALIDATA', label: 'Busqueda Validata' },
  { id: 'DIR_RENIEC', label: 'Dir. RENIEC' },
  { id: 'DIRECCION_CERTUS', label: 'Dirección Certus' },
  { id: 'TELEFONOS_BACKUS_INCENTIVO', label: 'Teléfonos Backus Incentivo' },
  { id: 'TELEFONOS_BACKUS_EQUIPOS_FRIO', label: 'Teléfonos Backus Equipos Frio' },
  { id: 'TELEFONOS_TIENDA_PAGO_EXTRA', label: 'Teléfonos Tienda Pago Extra' },
  { id: 'TELEFONOS_TIENDA_PAGO', label: 'Teléfonos Tienda Pago' },
  { id: 'TELEFONOS_ADEX', label: 'Teléfonos Adex' },
  { id: 'TELEFONOS_BACKUS_COBRANZA', label: 'Teléfonos Backus Cobranza' },
  { id: 'TELEFONOS_BACKUS_TIENDA_PAGO_EXTRA', label: 'Teléfonos Backus Tienda Pago Extra' },
  { id: 'TELEFONOS_BACKUS_TIENDA_PAGO', label: 'Teléfonos Backus Tienda Pago' },
  { id: 'TELEFONOS_TIENDA_PAGO_COBRANZA', label: 'Teléfonos Tienda Pago Cobranza' },
  { id: 'TELEFONOS_UPC', label: 'Teléfonos UPC' },
  { id: 'TELEFONOS_MOVILES_DUPREE', label: 'Teléfonos móviles Dupree' },
  { id: 'TELEFONOS_FIJO_DUPREE', label: 'Teléfonos Fijo Dupree' },
  { id: 'TELEFONOS_PUCP', label: 'Teléfonos PUCP' },
  { id: 'TELEFONOS_CULQI', label: 'Teléfonos CULQI' },
  { id: 'DIRECCION_CULQI', label: 'DIRECCIÓN CULQI' },
  { id: 'TELEFONOS_ALFIN', label: 'Teléfonos ALFIN' },
  { id: 'DIRECCION_ALFIN_BANCO', label: 'Dirección ALFIN BANCO' },
  { id: 'TELEFONOS_DERRAMA_MAGISTERIAL', label: 'Teléfonos DERRAMA MAGISTERIAL' },
  { id: 'TELEFONO_REFERENCIA_FAMILIARES', label: 'Teléfono Referencia - Familiares' },
  { id: 'TELEFONO_REFERENCIA_TERCEROS', label: 'Teléfono Referencia - Terceros' },
  { id: 'TELEFONOS_NATURA', label: 'Teléfonos Natura' },
  { id: 'DIRECCIONES_NATURA', label: 'Direcciones Natura' },
  { id: 'TELEFONOS_ELEDE_LINEA_DIRECTA', label: 'Teléfonos ELEDE - Línea Directa' },
  { id: 'DIRECCIONES_ELEDE_LINEA_DIRECTA', label: 'Direcciones ELEDE - Línea Directa' },
  { id: 'TELEFONOS_PICHINCHA', label: 'Teléfonos pichincha' },
  { id: 'DIRECCIONES_PICHINCHA_IBS', label: 'Direcciones Pichincha IBS' },
  { id: 'DIRECCIONES_PICHINCHA_ICS_DOMICILIO', label: 'Direcciones Pichincha ICS Domicilio' },
  { id: 'DIRECCIONES_PICHINCHA_ICS_LABORAL', label: 'Direcciones Pichincha ICS Laboral' },
  { id: 'PROVEEDOR_BASE_DATOS', label: 'Proveedor Base de Datos' },
  { id: 'TELEFONOS_UCIENTIFICA', label: 'Teléfonos UCientifica' },
  { id: 'TELEFONOS_VERISURE', label: 'Teléfonos Verisure' },
  { id: 'DIR_COMERCIAL_VERISURE_RECUPERO', label: 'Direccion Comercial VERISURE-RECUPERO' },
  { id: 'DIR_COMERCIAL_HEINEKEN', label: 'Direccion Comercial HEINEKEN' },
  { id: 'TELEFONOS_FULLER_PINTO', label: 'Teléfonos Fuller Pinto' },
];

export const llegoDeBaseOptions: SelectOption[] = [
  { id: 'BASE', label: 'BASE' },
  { id: '-', label: ' ' }
];

export const tipoDeudorOptions: SelectOption[] = [
  { id: 'TITULAR', label: 'TITULAR' },
  { id: 'AVAL', label: 'AVAL' }
];

export const estadosDireccionOptions: SelectOption[] = [
  { id: 'OPERATIVO', label: 'Operativo' },
  { id: 'INACTIVO', label: 'Inactivo' },
  { id: 'PENDIENTE', label: 'Pendiente' },
  { id: 'VERIFICAR', label: 'Por Verificar' },
  { id: 'ELIMINADO', label: 'Eliminado' },
];

export const ubigeoPeru: Ubigeo[] = [
  {
    id: '01',
    nombre: 'Amazonas',
    provincias: [
      {
        id: '0101',
        nombre: 'Chachapoyas',
        distritos: [
          { id: '010101', nombre: 'Chachapoyas' },
          { id: '010102', nombre: 'Asunción' },
          { id: '010103', nombre: 'Balsas' },
          { id: '010104', nombre: 'Cheto' },
          { id: '010105', nombre: 'Chiliquin' },
          { id: '010106', nombre: 'Chuquibamba' },
          { id: '010107', nombre: 'Granada' },
          { id: '010108', nombre: 'Huancas' },
          { id: '010109', nombre: 'La Jalca' },
          { id: '010110', nombre: 'Leimebamba' },
          { id: '010111', nombre: 'Levanto' },
          { id: '010112', nombre: 'Magdalena' },
          { id: '010113', nombre: 'Mariscal Castilla' },
          { id: '010114', nombre: 'Molinopampa' },
          { id: '010115', nombre: 'Montevideo' },
          { id: '010116', nombre: 'Olleros' },
          { id: '010117', nombre: 'Quinjalca' },
          { id: '010118', nombre: 'San Francisco de Daguas' },
          { id: '010119', nombre: 'San Isidro de Maino' },
          { id: '010120', nombre: 'Soloco' },
          { id: '010121', nombre: 'Sonche' }
        ]
      },
      {
        id: '0102',
        nombre: 'Bagua',
        distritos: [
          { id: '010201', nombre: 'Bagua' },
          { id: '010202', nombre: 'Aramango' },
          { id: '010203', nombre: 'Copallin' },
          { id: '010204', nombre: 'El Parco' },
          { id: '010205', nombre: 'Imaza' },
          { id: '010206', nombre: 'La Peca' }
        ]
      },
      {
        id: '0103',
        nombre: 'Bongará',
        distritos: [
          { id: '010301', nombre: 'Jumbilla' },
          { id: '010302', nombre: 'Chisquilla' },
          { id: '010303', nombre: 'Churuja' },
          { id: '010304', nombre: 'Corosha' },
          { id: '010305', nombre: 'Cuispes' },
          { id: '010306', nombre: 'Florida' },
          { id: '010307', nombre: 'Jazan' },
          { id: '010308', nombre: 'Recta' },
          { id: '010309', nombre: 'San Carlos' },
          { id: '010310', nombre: 'Shipasbamba' },
          { id: '010311', nombre: 'Valera' },
          { id: '010312', nombre: 'Yambrasbamba' }
        ]
      },
      {
        id: '0104',
        nombre: 'Condorcanqui',
        distritos: [
          { id: '010401', nombre: 'Nieva' },
          { id: '010402', nombre: 'El Cenepa' },
          { id: '010403', nombre: 'Río Santiago' }
        ]
      },
      {
        id: '0105',
        nombre: 'Luya',
        distritos: [
          { id: '010501', nombre: 'Lamud' },
          { id: '010502', nombre: 'Camporredondo' },
          { id: '010503', nombre: 'Cocabamba' },
          { id: '010504', nombre: 'Colcamar' },
          { id: '010505', nombre: 'Conila' },
          { id: '010506', nombre: 'Inguilpata' },
          { id: '010507', nombre: 'Longuita' },
          { id: '010508', nombre: 'Lonya Chico' },
          { id: '010509', nombre: 'Luya' },
          { id: '010510', nombre: 'Luya Viejo' },
          { id: '010511', nombre: 'María' },
          { id: '010512', nombre: 'Ocalli' },
          { id: '010513', nombre: 'Ocumal' },
          { id: '010514', nombre: 'Pisuquia' },
          { id: '010515', nombre: 'Providencia' },
          { id: '010516', nombre: 'San Cristóbal' },
          { id: '010517', nombre: 'San Francisco del Yeso' },
          { id: '010518', nombre: 'San Jerónimo' },
          { id: '010519', nombre: 'San Juan de Lopecancha' },
          { id: '010520', nombre: 'Santa Catalina' },
          { id: '010521', nombre: 'Santo Tomás' },
          { id: '010522', nombre: 'Tingo' },
          { id: '010523', nombre: 'Trita' }
        ]
      },
      {
        id: '0106',
        nombre: 'Rodríguez de Mendoza',
        distritos: [
          { id: '010601', nombre: 'San Nicolás' },
          { id: '010602', nombre: 'Chirimoto' },
          { id: '010603', nombre: 'Cochamal' },
          { id: '010604', nombre: 'Huambo' },
          { id: '010605', nombre: 'Limabamba' },
          { id: '010606', nombre: 'Longar' },
          { id: '010607', nombre: 'Mariscal Benavides' },
          { id: '010608', nombre: 'Milpuc' },
          { id: '010609', nombre: 'Omia' },
          { id: '010610', nombre: 'Santa Rosa' },
          { id: '010611', nombre: 'Totora' },
          { id: '010612', nombre: 'Vista Alegre' }
        ]
      },
      {
        id: '0107',
        nombre: 'Utcubamba',
        distritos: [
          { id: '010701', nombre: 'Bagua Grande' },
          { id: '010702', nombre: 'Cajaruro' },
          { id: '010703', nombre: 'Cumba' },
          { id: '010704', nombre: 'El Milagro' },
          { id: '010705', nombre: 'Jamalca' },
          { id: '010706', nombre: 'Lonya Grande' },
          { id: '010707', nombre: 'Yamon' }
        ]
      }
    ]
  },
  {
    id: '02',
    nombre: 'Áncash',
    provincias: [
      {
        id: '0201',
        nombre: 'Huaraz',
        distritos: [
          { id: '020101', nombre: 'Huaraz' },
          { id: '020102', nombre: 'Cochabamba' },
          { id: '020103', nombre: 'Colcabamba' },
          { id: '020104', nombre: 'Huanchay' },
          { id: '020105', nombre: 'Independencia' },
          { id: '020106', nombre: 'Jangas' },
          { id: '020107', nombre: 'La Libertad' },
          { id: '020108', nombre: 'Olleros' },
          { id: '020109', nombre: 'Pampas' },
          { id: '020110', nombre: 'Pariacoto' },
          { id: '020111', nombre: 'Pira' },
          { id: '020112', nombre: 'Tarica' }
        ]
      },
      {
        id: '0202',
        nombre: 'Aija',
        distritos: [
          { id: '020201', nombre: 'Aija' },
          { id: '020202', nombre: 'Coris' },
          { id: '020203', nombre: 'Huacllan' },
          { id: '020204', nombre: 'La Merced' },
          { id: '020205', nombre: 'Succha' }
        ]
      },
      {
        id: '0203',
        nombre: 'Antonio Raymondi',
        distritos: [
          { id: '020301', nombre: 'Llamellin' },
          { id: '020302', nombre: 'Aczo' },
          { id: '020303', nombre: 'Chaccho' },
          { id: '020304', nombre: 'Chingas' },
          { id: '020305', nombre: 'Mirgas' },
          { id: '020306', nombre: 'San Juan de Rontoy' }
        ]
      },
      {
        id: '0204',
        nombre: 'Asunción',
        distritos: [
          { id: '020401', nombre: 'Chacas' },
          { id: '020402', nombre: 'Acochaca' }
        ]
      },
      {
        id: '0205',
        nombre: 'Bolognesi',
        distritos: [
          { id: '020501', nombre: 'Chiquian' },
          { id: '020502', nombre: 'Abelardo Pardo Lezameta' },
          { id: '020503', nombre: 'Antonio Raymondi' },
          { id: '020504', nombre: 'Aquia' },
          { id: '020505', nombre: 'Cajacay' },
          { id: '020506', nombre: 'Canis' },
          { id: '020507', nombre: 'Colquioc' },
          { id: '020508', nombre: 'Huallanca' },
          { id: '020509', nombre: 'Huasta' },
          { id: '020510', nombre: 'Huayllacayan' },
          { id: '020511', nombre: 'La Primavera' },
          { id: '020512', nombre: 'Mangas' },
          { id: '020513', nombre: 'Pacllon' },
          { id: '020514', nombre: 'San Miguel de Corpanqui' },
          { id: '020515', nombre: 'Ticllos' }
        ]
      },
      {
        id: '0206',
        nombre: 'Carhuaz',
        distritos: [
          { id: '020601', nombre: 'Carhuaz' },
          { id: '020602', nombre: 'Acopampa' },
          { id: '020603', nombre: 'Amashca' },
          { id: '020604', nombre: 'Anta' },
          { id: '020605', nombre: 'Ataquero' },
          { id: '020606', nombre: 'Marcara' },
          { id: '020607', nombre: 'Pariahuanca' },
          { id: '020608', nombre: 'San Miguel de Aco' },
          { id: '020609', nombre: 'Shilla' },
          { id: '020610', nombre: 'Tinco' },
          { id: '020611', nombre: 'Yungar' }
        ]
      },
      {
        id: '0207',
        nombre: 'Carlos Fermín Fitzcarrald',
        distritos: [
          { id: '020701', nombre: 'San Luis' },
          { id: '020702', nombre: 'San Nicolás' },
          { id: '020703', nombre: 'Yauya' }
        ]
      },
      {
        id: '0208',
        nombre: 'Casma',
        distritos: [
          { id: '020801', nombre: 'Casma' },
          { id: '020802', nombre: 'Buena Vista Alta' },
          { id: '020803', nombre: 'Comandante Noel' },
          { id: '020804', nombre: 'Yautan' }
        ]
      },
      {
        id: '0209',
        nombre: 'Corongo',
        distritos: [
          { id: '020901', nombre: 'Corongo' },
          { id: '020902', nombre: 'Aco' },
          { id: '020903', nombre: 'Bambas' },
          { id: '020904', nombre: 'Cusca' },
          { id: '020905', nombre: 'La Pampa' },
          { id: '020906', nombre: 'Yanac' },
          { id: '020907', nombre: 'Yupan' }
        ]
      },
      {
        id: '0210',
        nombre: 'Huari',
        distritos: [
          { id: '021001', nombre: 'Huari' },
          { id: '021002', nombre: 'Anra' },
          { id: '021003', nombre: 'Cajay' },
          { id: '021004', nombre: 'Chavin de Huantar' },
          { id: '021005', nombre: 'Huacachi' },
          { id: '021006', nombre: 'Huacchis' },
          { id: '021007', nombre: 'Huachis' },
          { id: '021008', nombre: 'Huantar' },
          { id: '021009', nombre: 'Masin' },
          { id: '021010', nombre: 'Paucas' },
          { id: '021011', nombre: 'Ponto' },
          { id: '021012', nombre: 'Rahuapampa' },
          { id: '021013', nombre: 'Rapayan' },
          { id: '021014', nombre: 'San Marcos' },
          { id: '021015', nombre: 'San Pedro de Chana' },
          { id: '021016', nombre: 'Uco' }
        ]
      },
      {
        id: '0211',
        nombre: 'Huarmey',
        distritos: [
          { id: '021101', nombre: 'Huarmey' },
          { id: '021102', nombre: 'Cochapeti' },
          { id: '021103', nombre: 'Culebras' },
          { id: '021104', nombre: 'Huayan' },
          { id: '021105', nombre: 'Malvas' }
        ]
      },
      {
        id: '0212',
        nombre: 'Huaylas',
        distritos: [
          { id: '021201', nombre: 'Caraz' },
          { id: '021202', nombre: 'Huallanca' },
          { id: '021203', nombre: 'Huata' },
          { id: '021204', nombre: 'Huaylas' },
          { id: '021205', nombre: 'Mato' },
          { id: '021206', nombre: 'Pamparomas' },
          { id: '021207', nombre: 'Pueblo Libre' },
          { id: '021208', nombre: 'Santa Cruz' },
          { id: '021209', nombre: 'Santo Toribio' },
          { id: '021210', nombre: 'Yuracmarca' }
        ]
      },
      {
        id: '0213',
        nombre: 'Mariscal Luzuriaga',
        distritos: [
          { id: '021301', nombre: 'Piscobamba' },
          { id: '021302', nombre: 'Casca' },
          { id: '021303', nombre: 'Eleazar Guzmán Barron' },
          { id: '021304', nombre: 'Fidel Olivas Escudero' },
          { id: '021305', nombre: 'Llama' },
          { id: '021306', nombre: 'Llumpa' },
          { id: '021307', nombre: 'Lucma' },
          { id: '021308', nombre: 'Musga' },
          { id: '021309', nombre: 'Pomabamba' } // Nota: Pomabamba pertenece a esta provincia
        ]
      },
      {
        id: '0214',
        nombre: 'Ocros',
        distritos: [
          { id: '021401', nombre: 'Ocros' },
          { id: '021402', nombre: 'Acas' },
          { id: '021403', nombre: 'Cajamarquilla' },
          { id: '021404', nombre: 'Carhuapampa' },
          { id: '021405', nombre: 'Cochas' },
          { id: '021406', nombre: 'Congas' },
          { id: '021407', nombre: 'Llipa' },
          { id: '021408', nombre: 'San Cristóbal de Rajan' },
          { id: '021409', nombre: 'San Pedro' },
          { id: '021410', nombre: 'Santiago de Chilcas' }
        ]
      },
      {
        id: '0215',
        nombre: 'Pallasca',
        distritos: [
          { id: '021501', nombre: 'Cabana' },
          { id: '021502', nombre: 'Bolognesi' },
          { id: '021503', nombre: 'Conchucos' },
          { id: '021504', nombre: 'Huacaschuque' },
          { id: '021505', nombre: 'Huandoval' },
          { id: '021506', nombre: 'Lacabamba' },
          { id: '021507', nombre: 'Llapo' },
          { id: '021508', nombre: 'Pallasca' },
          { id: '021509', nombre: 'Pampas' },
          { id: '021510', nombre: 'Santa Rosa' },
          { id: '021511', nombre: 'Tauca' }
        ]
      },
      {
        id: '0216',
        nombre: 'Pomabamba',
        distritos: [
          { id: '021601', nombre: 'Pomabamba' },
          { id: '021602', nombre: 'Huayllan' },
          { id: '021603', nombre: 'Parobamba' },
          { id: '021604', nombre: 'Quinuabamba' }
        ]
      },
      {
        id: '0217',
        nombre: 'Recuay',
        distritos: [
          { id: '021701', nombre: 'Recuay' },
          { id: '021702', nombre: 'Catac' },
          { id: '021703', nombre: 'Cotaparaco' },
          { id: '021704', nombre: 'Huayllapampa' },
          { id: '021705', nombre: 'Llacllin' },
          { id: '021706', nombre: 'Marca' },
          { id: '021707', nombre: 'Pampas Chico' },
          { id: '021708', nombre: 'Pararin' },
          { id: '021709', nombre: 'Tapacocha' },
          { id: '021710', nombre: 'Ticapampa' }
        ]
      },
      {
        id: '0218',
        nombre: 'Santa',
        distritos: [
          { id: '021801', nombre: 'Chimbote' },
          { id: '021802', nombre: 'Caceres del Peru' },
          { id: '021803', nombre: 'Coishco' },
          { id: '021804', nombre: 'Macate' },
          { id: '021805', nombre: 'Moro' },
          { id: '021806', nombre: 'Nepeña' },
          { id: '021807', nombre: 'Samanco' },
          { id: '021808', nombre: 'Santa' },
          { id: '021809', nombre: 'Nuevo Chimbote' }
        ]
      },
      {
        id: '0219',
        nombre: 'Sihuas',
        distritos: [
          { id: '021901', nombre: 'Sihuas' },
          { id: '021902', nombre: 'Acobamba' },
          { id: '021903', nombre: 'Alfonso Ugarte' },
          { id: '021904', nombre: 'Cashapampa' },
          { id: '021905', nombre: 'Chingalpo' },
          { id: '021906', nombre: 'Huayllabamba' },
          { id: '021907', nombre: 'Quiches' },
          { id: '021908', nombre: 'Ragash' },
          { id: '021909', nombre: 'San Juan' },
          { id: '021910', nombre: 'Sicsibamba' }
        ]
      },
      {
        id: '0220',
        nombre: 'Yungay',
        distritos: [
          { id: '022001', nombre: 'Yungay' },
          { id: '022002', nombre: 'Cascapara' },
          { id: '022003', nombre: 'Mancos' },
          { id: '022004', nombre: 'Matacoto' },
          { id: '022005', nombre: 'Quillo' },
          { id: '022006', nombre: 'Ranrahirca' },
          { id: '022007', nombre: 'Shupluy' },
          { id: '022008', nombre: 'Yanama' }
        ]
      }
    ]
  },
  {
    id: '03',
    nombre: 'Apurímac',
    provincias: [
      {
        id: '0301',
        nombre: 'Abancay',
        distritos: [
          { id: '030101', nombre: 'Abancay' },
          { id: '030102', nombre: 'Chacoche' },
          { id: '030103', nombre: 'Circa' },
          { id: '030104', nombre: 'Curahuasi' },
          { id: '030105', nombre: 'Huanipaca' },
          { id: '030106', nombre: 'Lambrama' },
          { id: '030107', nombre: 'Pichirhua' },
          { id: '030108', nombre: 'San Pedro de Cachora' },
          { id: '030109', nombre: 'Tamburco' }
        ]
      },
      {
        id: '0302',
        nombre: 'Andahuaylas',
        distritos: [
          { id: '030201', nombre: 'Andahuaylas' },
          { id: '030202', nombre: 'Andarapa' },
          { id: '030203', nombre: 'Chiara' },
          { id: '030204', nombre: 'Huancarama' },
          { id: '030205', nombre: 'Huancaray' },
          { id: '030206', nombre: 'Huayana' },
          { id: '030207', nombre: 'Kishuara' },
          { id: '030208', nombre: 'Pacobamba' },
          { id: '030209', nombre: 'Pacucha' },
          { id: '030210', nombre: 'Pampachiri' },
          { id: '030211', nombre: 'Pomacocha' },
          { id: '030212', nombre: 'San Antonio de Cachi' },
          { id: '030213', nombre: 'San Jerónimo' },
          { id: '030214', nombre: 'San Miguel de Chaccrampa' },
          { id: '030215', nombre: 'Santa María de Chicmo' },
          { id: '030216', nombre: 'Talavera' },
          { id: '030217', nombre: 'Tumay Huaraca' },
          { id: '030218', nombre: 'Turpo' },
          { id: '030219', nombre: 'Kaquiabamba' },
          { id: '030220', nombre: 'José María Arguedas' }
        ]
      },
      {
        id: '0303',
        nombre: 'Antabamba',
        distritos: [
          { id: '030301', nombre: 'Antabamba' },
          { id: '030302', nombre: 'El Oro' },
          { id: '030303', nombre: 'Huaquirca' },
          { id: '030304', nombre: 'Juan Espinoza Medrano' },
          { id: '030305', nombre: 'Oropesa' },
          { id: '030306', nombre: 'Pachaconas' },
          { id: '030307', nombre: 'Sabaino' }
        ]
      },
      {
        id: '0304',
        nombre: 'Aymaraes',
        distritos: [
          { id: '030401', nombre: 'Chalhuanca' },
          { id: '030402', nombre: 'Capaya' },
          { id: '030403', nombre: 'Caraybamba' },
          { id: '030404', nombre: 'Chapimarca' },
          { id: '030405', nombre: 'Colcabamba' },
          { id: '030406', nombre: 'Cotaruse' },
          { id: '030407', nombre: 'Huayllu' },
          { id: '030408', nombre: 'Justo Apu Sahuaraura' },
          { id: '030409', nombre: 'Lucre' },
          { id: '030410', nombre: 'Pocohuanca' },
          { id: '030411', nombre: 'San Juan de Chacña' },
          { id: '030412', nombre: 'Sañayca' },
          { id: '030413', nombre: 'Soraya' },
          { id: '030414', nombre: 'Tapairihua' },
          { id: '030415', nombre: 'Tintay' },
          { id: '030416', nombre: 'Toraya' },
          { id: '030417', nombre: 'Yanaca' }
        ]
      },
      {
        id: '0305',
        nombre: 'Cotabambas',
        distritos: [
          { id: '030501', nombre: 'Tambobamba' },
          { id: '030502', nombre: 'Cotabamba' },
          { id: '030503', nombre: 'Coyllurqui' },
          { id: '030504', nombre: 'Haquira' },
          { id: '030505', nombre: 'Mara' },
          { id: '030506', nombre: 'Challhuahuacho' }
        ]
      },
      {
        id: '0306',
        nombre: 'Chincheros',
        distritos: [
          { id: '030601', nombre: 'Chincheros' },
          { id: '030602', nombre: 'Anco_Huallo' },
          { id: '030603', nombre: 'Cocharcas' },
          { id: '030604', nombre: 'Huaccana' },
          { id: '030605', nombre: 'Ocobamba' },
          { id: '030606', nombre: 'Ongoy' },
          { id: '030607', nombre: 'Uranmarca' },
          { id: '030608', nombre: 'Ranracancha' },
          { id: '030609', nombre: 'Rocchacc' },
          { id: '030610', nombre: 'El Porvenir' },
          { id: '030611', nombre: 'Los Chankas' }
        ]
      },
      {
        id: '0307',
        nombre: 'Grau',
        distritos: [
          { id: '030701', nombre: 'Chuquibambilla' },
          { id: '030702', nombre: 'Curpahuasi' },
          { id: '030703', nombre: 'Gamarra' },
          { id: '030704', nombre: 'Huayllati' },
          { id: '030705', nombre: 'Mamara' },
          { id: '030706', nombre: 'Micaela Bastidas' },
          { id: '030707', nombre: 'Pataypampa' },
          { id: '030708', nombre: 'Progreso' },
          { id: '030709', nombre: 'San Antonio' },
          { id: '030710', nombre: 'Santa Rosa' },
          { id: '030711', nombre: 'Turpay' },
          { id: '030712', nombre: 'Vilcabamba' },
          { id: '030713', nombre: 'Virundo' },
          { id: '030714', nombre: 'Curasco' }
        ]
      }
    ]
  },
  {
    id: '04',
    nombre: 'Arequipa',
    provincias: [
      {
        id: '0401',
        nombre: 'Arequipa',
        distritos: [
          { id: '040101', nombre: 'Arequipa' },
          { id: '040102', nombre: 'Alto Selva Alegre' },
          { id: '040103', nombre: 'Cayma' },
          { id: '040104', nombre: 'Cerro Colorado' },
          { id: '040105', nombre: 'Characato' },
          { id: '040106', nombre: 'Chiguata' },
          { id: '040107', nombre: 'Jacobo Hunter' },
          { id: '040108', nombre: 'José Luis Bustamante y Rivero' },
          { id: '040109', nombre: 'La Joya' },
          { id: '040110', nombre: 'Mariano Melgar' },
          { id: '040111', nombre: 'Miraflores' },
          { id: '040112', nombre: 'Mollebaya' },
          { id: '040113', nombre: 'Paucarpata' },
          { id: '040114', nombre: 'Pocsi' },
          { id: '040115', nombre: 'Polobaya' },
          { id: '040116', nombre: 'Quequeña' },
          { id: '040117', nombre: 'Sabandia' },
          { id: '040118', nombre: 'Sachaca' },
          { id: '040119', nombre: 'San Juan de Siguas' },
          { id: '040120', nombre: 'San Juan de Tarucani' },
          { id: '040121', nombre: 'Santa Isabel de Siguas' },
          { id: '040122', nombre: 'Santa Rita de Siguas' },
          { id: '040123', nombre: 'Socabaya' },
          { id: '040124', nombre: 'Tiabaya' },
          { id: '040125', nombre: 'Uchumayo' },
          { id: '040126', nombre: 'Vitor' },
          { id: '040127', nombre: 'Yanahuara' },
          { id: '040128', nombre: 'Yarabamba' },
          { id: '040129', nombre: 'Yura' },
          { id: '040130', nombre: 'José María San Martín' } // Antes Quequeña? ajuste
        ]
      },
      {
        id: '0402',
        nombre: 'Camaná',
        distritos: [
          { id: '040201', nombre: 'Camaná' },
          { id: '040202', nombre: 'José María Quimper' },
          { id: '040203', nombre: 'Mariano Nicolás Valcárcel' },
          { id: '040204', nombre: 'Mariscal Cáceres' },
          { id: '040205', nombre: 'Nicolás de Piérola' },
          { id: '040206', nombre: 'Ocoña' },
          { id: '040207', nombre: 'Quilca' },
          { id: '040208', nombre: 'Samuel Pastor' }
        ]
      },
      {
        id: '0403',
        nombre: 'Caravelí',
        distritos: [
          { id: '040301', nombre: 'Caravelí' },
          { id: '040302', nombre: 'Acarí' },
          { id: '040303', nombre: 'Atico' },
          { id: '040304', nombre: 'Atiquipa' },
          { id: '040305', nombre: 'Bella Unión' },
          { id: '040306', nombre: 'Cahuacho' },
          { id: '040307', nombre: 'Chala' },
          { id: '040308', nombre: 'Chaparra' },
          { id: '040309', nombre: 'Huanuhuanu' },
          { id: '040310', nombre: 'Jaqui' },
          { id: '040311', nombre: 'Lomas' },
          { id: '040312', nombre: 'Quicacha' },
          { id: '040313', nombre: 'Yauca' }
        ]
      },
      {
        id: '0404',
        nombre: 'Castilla',
        distritos: [
          { id: '040401', nombre: 'Aplao' },
          { id: '040402', nombre: 'Andagua' },
          { id: '040403', nombre: 'Ayo' },
          { id: '040404', nombre: 'Chachas' },
          { id: '040405', nombre: 'Chilcaymarca' },
          { id: '040406', nombre: 'Choco' },
          { id: '040407', nombre: 'Huancarqui' },
          { id: '040408', nombre: 'Machaguay' },
          { id: '040409', nombre: 'Orcopampa' },
          { id: '040410', nombre: 'Pampacolca' },
          { id: '040411', nombre: 'Tipan' },
          { id: '040412', nombre: 'Uñon' },
          { id: '040413', nombre: 'Uraca' },
          { id: '040414', nombre: 'Viraco' }
        ]
      },
      {
        id: '0405',
        nombre: 'Caylloma',
        distritos: [
          { id: '040501', nombre: 'Chivay' },
          { id: '040502', nombre: 'Achoma' },
          { id: '040503', nombre: 'Cabanaconde' },
          { id: '040504', nombre: 'Callalli' },
          { id: '040505', nombre: 'Caylloma' },
          { id: '040506', nombre: 'Coporaque' },
          { id: '040507', nombre: 'Huambo' },
          { id: '040508', nombre: 'Huanca' },
          { id: '040509', nombre: 'Ichupampa' },
          { id: '040510', nombre: 'Lari' },
          { id: '040511', nombre: 'Lluta' },
          { id: '040512', nombre: 'Maca' },
          { id: '040513', nombre: 'Madrigal' },
          { id: '040514', nombre: 'San Antonio de Chuca' },
          { id: '040515', nombre: 'Sibayo' },
          { id: '040516', nombre: 'Tapay' },
          { id: '040517', nombre: 'Tisco' },
          { id: '040518', nombre: 'Tuti' },
          { id: '040519', nombre: 'Yanque' },
          { id: '040520', nombre: 'Majes' }
        ]
      },
      {
        id: '0406',
        nombre: 'Condesuyos',
        distritos: [
          { id: '040601', nombre: 'Chuquibamba' },
          { id: '040602', nombre: 'Andaray' },
          { id: '040603', nombre: 'Cayarani' },
          { id: '040604', nombre: 'Chichas' },
          { id: '040605', nombre: 'Iray' },
          { id: '040606', nombre: 'Río Grande' },
          { id: '040607', nombre: 'Salamanca' },
          { id: '040608', nombre: 'Yanaquihua' }
        ]
      },
      {
        id: '0407',
        nombre: 'Islay',
        distritos: [
          { id: '040701', nombre: 'Mollendo' },
          { id: '040702', nombre: 'Cocachacra' },
          { id: '040703', nombre: 'Dean Valdivia' },
          { id: '040704', nombre: 'Islay' },
          { id: '040705', nombre: 'Mejia' },
          { id: '040706', nombre: 'Punta de Bombón' }
        ]
      },
      {
        id: '0408',
        nombre: 'La Uniòn',
        distritos: [
          { id: '040801', nombre: 'Cotahuasi' },
          { id: '040802', nombre: 'Alca' },
          { id: '040803', nombre: 'Charcana' },
          { id: '040804', nombre: 'Huaynacotas' },
          { id: '040805', nombre: 'Pampamarca' },
          { id: '040806', nombre: 'Puyca' },
          { id: '040807', nombre: 'Quechualla' },
          { id: '040808', nombre: 'Sayla' },
          { id: '040809', nombre: 'Tauria' },
          { id: '040810', nombre: 'Tomepampa' },
          { id: '040811', nombre: 'Toro' }
        ]
      }
    ]
  },
  {
    id: '05',
    nombre: 'Ayacucho',
    provincias: [
      {
        id: '0501',
        nombre: 'Huamanga',
        distritos: [
          { id: '050101', nombre: 'Ayacucho' },
          { id: '050102', nombre: 'Acocro' },
          { id: '050103', nombre: 'Acos Vinchos' },
          { id: '050104', nombre: 'Carmen Alto' },
          { id: '050105', nombre: 'Chiara' },
          { id: '050106', nombre: 'Ocros' },
          { id: '050107', nombre: 'Pacaycasa' },
          { id: '050108', nombre: 'Quinua' },
          { id: '050109', nombre: 'San José de Ticllas' },
          { id: '050110', nombre: 'San Juan Bautista' },
          { id: '050111', nombre: 'Santiago de Pischa' },
          { id: '050112', nombre: 'Socos' },
          { id: '050113', nombre: 'Tambillo' },
          { id: '050114', nombre: 'Vinchos' },
          { id: '050115', nombre: 'Jesús Nazareno' }
        ]
      },
      {
        id: '0502',
        nombre: 'Cangallo',
        distritos: [
          { id: '050201', nombre: 'Cangallo' },
          { id: '050202', nombre: 'Chuschi' },
          { id: '050203', nombre: 'Los Morochucos' },
          { id: '050204', nombre: 'María Parado de Bellido' },
          { id: '050205', nombre: 'Paras' },
          { id: '050206', nombre: 'Totos' }
        ]
      },
      {
        id: '0503',
        nombre: 'Huanca Sancos',
        distritos: [
          { id: '050301', nombre: 'Sancos' },
          { id: '050302', nombre: 'Carapo' },
          { id: '050303', nombre: 'Sacsamarca' },
          { id: '050304', nombre: 'Santiago de Lucanamarca' }
        ]
      },
      {
        id: '0504',
        nombre: 'Huanta',
        distritos: [
          { id: '050401', nombre: 'Huanta' },
          { id: '050402', nombre: 'Ayahuanco' },
          { id: '050403', nombre: 'Huamanguilla' },
          { id: '050404', nombre: 'Iguain' },
          { id: '050405', nombre: 'Luricocha' },
          { id: '050406', nombre: 'Santillana' },
          { id: '050407', nombre: 'Sivia' },
          { id: '050408', nombre: 'Llochegua' },
          { id: '050409', nombre: 'Canayre' },
          { id: '050410', nombre: 'Uchuraccay' },
          { id: '050411', nombre: 'Pucacolpa' },
          { id: '050412', nombre: 'Chaca' }
        ]
      },
      {
        id: '0505',
        nombre: 'La Mar',
        distritos: [
          { id: '050501', nombre: 'San Miguel' },
          { id: '050502', nombre: 'Anco' },
          { id: '050503', nombre: 'Ayna' },
          { id: '050504', nombre: 'Chilcas' },
          { id: '050505', nombre: 'Chungui' },
          { id: '050506', nombre: 'Luis Carranza' },
          { id: '050507', nombre: 'Santa Rosa' },
          { id: '050508', nombre: 'Tambo' },
          { id: '050509', nombre: 'Samugari' },
          { id: '050510', nombre: 'Anchihuay' },
          { id: '050511', nombre: 'Oronccoy' }
        ]
      },
      {
        id: '0506',
        nombre: 'Lucanas',
        distritos: [
          { id: '050601', nombre: 'Puquio' },
          { id: '050602', nombre: 'Aucara' },
          { id: '050603', nombre: 'Cabana' },
          { id: '050604', nombre: 'Carmen Salcedo' },
          { id: '050605', nombre: 'Chaviña' },
          { id: '050606', nombre: 'Chipao' },
          { id: '050607', nombre: 'Huac-Huas' },
          { id: '050608', nombre: 'Laramate' },
          { id: '050609', nombre: 'Leoncio Prado' },
          { id: '050610', nombre: 'Llauta' },
          { id: '050611', nombre: 'Lucanas' },
          { id: '050612', nombre: 'Ocaña' },
          { id: '050613', nombre: 'Otoca' },
          { id: '050614', nombre: 'Saisa' },
          { id: '050615', nombre: 'San Cristóbal' },
          { id: '050616', nombre: 'San Juan' },
          { id: '050617', nombre: 'San Pedro' },
          { id: '050618', nombre: 'San Pedro de Palco' },
          { id: '050619', nombre: 'Sancos' },
          { id: '050620', nombre: 'Santa Ana de Huaycahuacho' },
          { id: '050621', nombre: 'Santa Lucia' }
        ]
      },
      {
        id: '0507',
        nombre: 'Parinacochas',
        distritos: [
          { id: '050701', nombre: 'Coracora' },
          { id: '050702', nombre: 'Chumpi' },
          { id: '050703', nombre: 'Coronel Castañeda' },
          { id: '050704', nombre: 'Pacapausa' },
          { id: '050705', nombre: 'Pullo' },
          { id: '050706', nombre: 'Puyusca' },
          { id: '050707', nombre: 'San Francisco de Ravacayco' },
          { id: '050708', nombre: 'Upahuacho' }
        ]
      },
      {
        id: '0508',
        nombre: 'Páucar del Sara Sara',
        distritos: [
          { id: '050801', nombre: 'Pausa' },
          { id: '050802', nombre: 'Colta' },
          { id: '050803', nombre: 'Corculla' },
          { id: '050804', nombre: 'Lampa' },
          { id: '050805', nombre: 'Marcabamba' },
          { id: '050806', nombre: 'Oyolo' },
          { id: '050807', nombre: 'Pararca' },
          { id: '050808', nombre: 'San Javier de Alpabamba' },
          { id: '050809', nombre: 'San José de Ushua' },
          { id: '050810', nombre: 'Sara Sara' }
        ]
      },
      {
        id: '0509',
        nombre: 'Sucre',
        distritos: [
          { id: '050901', nombre: 'Querobamba' },
          { id: '050902', nombre: 'Belén' },
          { id: '050903', nombre: 'Chalcos' },
          { id: '050904', nombre: 'Chilcayoc' },
          { id: '050905', nombre: 'Huacaña' },
          { id: '050906', nombre: 'Morcolla' },
          { id: '050907', nombre: 'Paico' },
          { id: '050908', nombre: 'San Pedro de Larcay' },
          { id: '050909', nombre: 'San Salvador de Quije' },
          { id: '050910', nombre: 'Santiago de Paucaray' },
          { id: '050911', nombre: 'Soras' }
        ]
      },
      {
        id: '0510',
        nombre: 'Víctor Fajardo',
        distritos: [
          { id: '051001', nombre: 'Huancapi' },
          { id: '051002', nombre: 'Alcamenca' },
          { id: '051003', nombre: 'Apongo' },
          { id: '051004', nombre: 'Asquipata' },
          { id: '051005', nombre: 'Canaria' },
          { id: '051006', nombre: 'Cayara' },
          { id: '051007', nombre: 'Colca' },
          { id: '051008', nombre: 'Huamanquiquia' },
          { id: '051009', nombre: 'Huancaraylla' },
          { id: '051010', nombre: 'Huaya' },
          { id: '051011', nombre: 'Sarhua' },
          { id: '051012', nombre: 'Vilcanchos' }
        ]
      },
      {
        id: '0511',
        nombre: 'Vilcas Huamán',
        distritos: [
          { id: '051101', nombre: 'Vilcas Huamán' },
          { id: '051102', nombre: 'Accomarca' },
          { id: '051103', nombre: 'Carhuanca' },
          { id: '051104', nombre: 'Concepción' },
          { id: '051105', nombre: 'Huambalpa' },
          { id: '051106', nombre: 'Independencia' },
          { id: '051107', nombre: 'Saurama' },
          { id: '051108', nombre: 'Vischongo' }
        ]
      }
    ]
  },
  {
    id: '06',
    nombre: 'Cajamarca',
    provincias: [
      {
        id: '0601',
        nombre: 'Cajamarca',
        distritos: [
          { id: '060101', nombre: 'Cajamarca' },
          { id: '060102', nombre: 'Asunción' },
          { id: '060103', nombre: 'Chetilla' },
          { id: '060104', nombre: 'Cospán' },
          { id: '060105', nombre: 'Encañada' },
          { id: '060106', nombre: 'Jesús' },
          { id: '060107', nombre: 'Llacanora' },
          { id: '060108', nombre: 'Los Baños del Inca' },
          { id: '060109', nombre: 'Magdalena' },
          { id: '060110', nombre: 'Matará' },
          { id: '060111', nombre: 'Namora' },
          { id: '060112', nombre: 'San Juan' }
        ]
      },
      {
        id: '0602',
        nombre: 'Cajabamba',
        distritos: [
          { id: '060201', nombre: 'Cajabamba' },
          { id: '060202', nombre: 'Cachachi' },
          { id: '060203', nombre: 'Condebamba' },
          { id: '060204', nombre: 'Sitacocha' }
        ]
      },
      {
        id: '0603',
        nombre: 'Celendín',
        distritos: [
          { id: '060301', nombre: 'Celendín' },
          { id: '060302', nombre: 'Chumuch' },
          { id: '060303', nombre: 'Cortegana' },
          { id: '060304', nombre: 'Huasmin' },
          { id: '060305', nombre: 'Jorge Chávez' },
          { id: '060306', nombre: 'José Gálvez' },
          { id: '060307', nombre: 'La Libertad de Pallan' },
          { id: '060308', nombre: 'Miguel Iglesias' },
          { id: '060309', nombre: 'Oxamarca' },
          { id: '060310', nombre: 'Socota' },
          { id: '060311', nombre: 'Sucre' },
          { id: '060312', nombre: 'Utco' }
        ]
      },
      {
        id: '0604',
        nombre: 'Chota',
        distritos: [
          { id: '060401', nombre: 'Chota' },
          { id: '060402', nombre: 'Anguía' },
          { id: '060403', nombre: 'Chadin' },
          { id: '060404', nombre: 'Chiguirip' },
          { id: '060405', nombre: 'Chimban' },
          { id: '060406', nombre: 'Choropampa' },
          { id: '060407', nombre: 'Cochabamba' },
          { id: '060408', nombre: 'Conchán' },
          { id: '060409', nombre: 'Huambos' },
          { id: '060410', nombre: 'Lajas' },
          { id: '060411', nombre: 'Llama' },
          { id: '060412', nombre: 'Miracosta' },
          { id: '060413', nombre: 'Paccha' },
          { id: '060414', nombre: 'Pion' },
          { id: '060415', nombre: 'Querocoto' },
          { id: '060416', nombre: 'San Juan de Licupis' },
          { id: '060417', nombre: 'Tacabamba' },
          { id: '060418', nombre: 'Tocmoche' },
          { id: '060419', nombre: 'Chalamarca' }
        ]
      },
      {
        id: '0605',
        nombre: 'Contumazá',
        distritos: [
          { id: '060501', nombre: 'Contumazá' },
          { id: '060502', nombre: 'Chilete' },
          { id: '060503', nombre: 'Cupisnique' },
          { id: '060504', nombre: 'Guzmango' },
          { id: '060505', nombre: 'San Benito' },
          { id: '060506', nombre: 'Santa Cruz de Toledo' },
          { id: '060507', nombre: 'Tantarica' },
          { id: '060508', nombre: 'Yonán' }
        ]
      },
      {
        id: '0606',
        nombre: 'Cutervo',
        distritos: [
          { id: '060601', nombre: 'Cutervo' },
          { id: '060602', nombre: 'Callayuc' },
          { id: '060603', nombre: 'Choros' },
          { id: '060604', nombre: 'Cujillo' },
          { id: '060605', nombre: 'La Ramada' },
          { id: '060606', nombre: 'Pimpingos' },
          { id: '060607', nombre: 'Querocotillo' },
          { id: '060608', nombre: 'San Andrés de Cutervo' },
          { id: '060609', nombre: 'San Juan de Cutervo' },
          { id: '060610', nombre: 'San Luis de Lucma' },
          { id: '060611', nombre: 'Santa Cruz' },
          { id: '060612', nombre: 'Santo Domingo de la Capilla' },
          { id: '060613', nombre: 'Santo Tomás' },
          { id: '060614', nombre: 'Socota' },
          { id: '060615', nombre: 'Toribio Casanova' }
        ]
      },
      {
        id: '0607',
        nombre: 'Hualgayoc',
        distritos: [
          { id: '060701', nombre: 'Bambamarca' },
          { id: '060702', nombre: 'Chugur' },
          { id: '060703', nombre: 'Hualgayoc' }
        ]
      },
      {
        id: '0608',
        nombre: 'Jaén',
        distritos: [
          { id: '060801', nombre: 'Jaén' },
          { id: '060802', nombre: 'Bellavista' },
          { id: '060803', nombre: 'Chontalí' },
          { id: '060804', nombre: 'Colasay' },
          { id: '060805', nombre: 'Huabal' },
          { id: '060806', nombre: 'Las Pirias' },
          { id: '060807', nombre: 'Pomahuaca' },
          { id: '060808', nombre: 'Pucará' },
          { id: '060809', nombre: 'Sallique' },
          { id: '060810', nombre: 'San Felipe' },
          { id: '060811', nombre: 'San José del Alto' },
          { id: '060812', nombre: 'Santa Rosa' }
        ]
      },
      {
        id: '0609',
        nombre: 'San Ignacio',
        distritos: [
          { id: '060901', nombre: 'San Ignacio' },
          { id: '060902', nombre: 'Chirinos' },
          { id: '060903', nombre: 'Huarango' },
          { id: '060904', nombre: 'La Coipa' },
          { id: '060905', nombre: 'Namballe' },
          { id: '060906', nombre: 'San José de Lourdes' },
          { id: '060907', nombre: 'Tabaconas' }
        ]
      },
      {
        id: '0610',
        nombre: 'San Marcos',
        distritos: [
          { id: '061001', nombre: 'San Marcos' },
          { id: '061002', nombre: 'Chancay' },
          { id: '061003', nombre: 'Eduardo Villanueva' },
          { id: '061004', nombre: 'Gregorio Pita' },
          { id: '061005', nombre: 'Ichocan' },
          { id: '061006', nombre: 'José Manuel Quiroz' },
          { id: '061007', nombre: 'José Sabogal' },
          { id: '061008', nombre: 'Pedro Gálvez' }
        ]
      },
      {
        id: '0611',
        nombre: 'San Miguel',
        distritos: [
          { id: '061101', nombre: 'San Miguel' },
          { id: '061102', nombre: 'Bolívar' },
          { id: '061103', nombre: 'Calquis' },
          { id: '061104', nombre: 'Catilluc' },
          { id: '061105', nombre: 'El Prado' },
          { id: '061106', nombre: 'La Florida' },
          { id: '061107', nombre: 'Llapa' },
          { id: '061108', nombre: 'Nanchoc' },
          { id: '061109', nombre: 'Niepos' },
          { id: '061110', nombre: 'San Gregorio' },
          { id: '061111', nombre: 'San Silvestre de Cochan' },
          { id: '061112', nombre: 'Tongod' },
          { id: '061113', nombre: 'Unión Agua Blanca' }
        ]
      },
      {
        id: '0612',
        nombre: 'San Pablo',
        distritos: [
          { id: '061201', nombre: 'San Pablo' },
          { id: '061202', nombre: 'San Bernardino' },
          { id: '061203', nombre: 'San Luis' },
          { id: '061204', nombre: 'Tumbaden' }
        ]
      },
      {
        id: '0613',
        nombre: 'Santa Cruz',
        distritos: [
          { id: '061301', nombre: 'Santa Cruz' },
          { id: '061302', nombre: 'Andabamba' },
          { id: '061303', nombre: 'Catache' },
          { id: '061304', nombre: 'Chancaybaños' },
          { id: '061305', nombre: 'La Esperanza' },
          { id: '061306', nombre: 'Ninabamba' },
          { id: '061307', nombre: 'Pulán' },
          { id: '061308', nombre: 'Saucepampa' },
          { id: '061309', nombre: 'Sexi' },
          { id: '061310', nombre: 'Uticyacu' },
          { id: '061311', nombre: 'Yauyucan' }
        ]
      }
    ]
  },
  {
    id: '07',
    nombre: 'Callao',
    provincias: [
      {
        id: '0701',
        nombre: 'Callao',
        distritos: [
          { id: '070101', nombre: 'Callao' },
          { id: '070102', nombre: 'Bellavista' },
          { id: '070103', nombre: 'Carmen de la Legua Reynoso' },
          { id: '070104', nombre: 'La Perla' },
          { id: '070105', nombre: 'La Punta' },
          { id: '070106', nombre: 'Ventanilla' },
          { id: '070107', nombre: 'Mi Perú' }
        ]
      }
    ]
  },
  {
    id: '08',
    nombre: 'Cusco',
    provincias: [
      {
        id: '0801',
        nombre: 'Cusco',
        distritos: [
          { id: '080101', nombre: 'Cusco' },
          { id: '080102', nombre: 'Ccorca' },
          { id: '080103', nombre: 'Poroy' },
          { id: '080104', nombre: 'San Jerónimo' },
          { id: '080105', nombre: 'San Sebastian' },
          { id: '080106', nombre: 'Santiago' },
          { id: '080107', nombre: 'Saylla' },
          { id: '080108', nombre: 'Wanchaq' }
        ]
      },
      {
        id: '0802',
        nombre: 'Acomayo',
        distritos: [
          { id: '080201', nombre: 'Acomayo' },
          { id: '080202', nombre: 'Acopia' },
          { id: '080203', nombre: 'Acos' },
          { id: '080204', nombre: 'Mosoc Llacta' },
          { id: '080205', nombre: 'Pomacanchi' },
          { id: '080206', nombre: 'Rondocan' },
          { id: '080207', nombre: 'Sangarará' }
        ]
      },
      {
        id: '0803',
        nombre: 'Anta',
        distritos: [
          { id: '080301', nombre: 'Anta' },
          { id: '080302', nombre: 'Ancahuasi' },
          { id: '080303', nombre: 'Cachimayo' },
          { id: '080304', nombre: 'Chinchaypujio' },
          { id: '080305', nombre: 'Huarocondo' },
          { id: '080306', nombre: 'Limatambo' },
          { id: '080307', nombre: 'Mollepata' },
          { id: '080308', nombre: 'Pucyura' },
          { id: '080309', nombre: 'Zurite' }
        ]
      },
      {
        id: '0804',
        nombre: 'Calca',
        distritos: [
          { id: '080401', nombre: 'Calca' },
          { id: '080402', nombre: 'Coya' },
          { id: '080403', nombre: 'Lamay' },
          { id: '080404', nombre: 'Lares' },
          { id: '080405', nombre: 'Pisac' },
          { id: '080406', nombre: 'San Salvador' },
          { id: '080407', nombre: 'Taray' },
          { id: '080408', nombre: 'Yanatile' }
        ]
      },
      {
        id: '0805',
        nombre: 'Canas',
        distritos: [
          { id: '080501', nombre: 'Yanaoca' },
          { id: '080502', nombre: 'Checca' },
          { id: '080503', nombre: 'Kunturkanki' },
          { id: '080504', nombre: 'Langui' },
          { id: '080505', nombre: 'Layo' },
          { id: '080506', nombre: 'Pampamarca' },
          { id: '080507', nombre: 'Quehue' },
          { id: '080508', nombre: 'Tupac Amaru' }
        ]
      },
      {
        id: '0806',
        nombre: 'Canchis',
        distritos: [
          { id: '080601', nombre: 'Sicuani' },
          { id: '080602', nombre: 'Checacupe' },
          { id: '080603', nombre: 'Combapata' },
          { id: '080604', nombre: 'Marangani' },
          { id: '080605', nombre: 'Pitumarca' },
          { id: '080606', nombre: 'San Pablo' },
          { id: '080607', nombre: 'San Pedro' },
          { id: '080608', nombre: 'Tinta' }
        ]
      },
      {
        id: '0807',
        nombre: 'Chumbivilcas',
        distritos: [
          { id: '080701', nombre: 'Santo Tomás' },
          { id: '080702', nombre: 'Capacmarca' },
          { id: '080703', nombre: 'Chamaca' },
          { id: '080704', nombre: 'Colquemarca' },
          { id: '080705', nombre: 'Livitaca' },
          { id: '080706', nombre: 'Llusco' },
          { id: '080707', nombre: 'Quiñota' },
          { id: '080708', nombre: 'Velille' }
        ]
      },
      {
        id: '0808',
        nombre: 'Espinar',
        distritos: [
          { id: '080801', nombre: 'Yauri' },
          { id: '080802', nombre: 'Condoroma' },
          { id: '080803', nombre: 'Coporaque' },
          { id: '080804', nombre: 'Ocoruro' },
          { id: '080805', nombre: 'Pallpata' },
          { id: '080806', nombre: 'Pichigua' },
          { id: '080807', nombre: 'Suyckutambo' },
          { id: '080808', nombre: 'Alto Pichigua' }
        ]
      },
      {
        id: '0809',
        nombre: 'La Convención',
        distritos: [
          { id: '080901', nombre: 'Quillabamba' },
          { id: '080902', nombre: 'Echarate' },
          { id: '080903', nombre: 'Huayopata' },
          { id: '080904', nombre: 'Maranura' },
          { id: '080905', nombre: 'Ocobamba' },
          { id: '080906', nombre: 'Santa Teresa' },
          { id: '080907', nombre: 'Vilcabamba' },
          { id: '080908', nombre: 'Kimbiri' },
          { id: '080909', nombre: 'Pichari' },
          { id: '080910', nombre: 'Inkawasi' },
          { id: '080911', nombre: 'Villa Virgen' },
          { id: '080912', nombre: 'Villa Kintiarina' },
          { id: '080913', nombre: 'Megantoni' }
        ]
      },
      {
        id: '0810',
        nombre: 'Paruro',
        distritos: [
          { id: '081001', nombre: 'Paruro' },
          { id: '081002', nombre: 'Accha' },
          { id: '081003', nombre: 'Ccapi' },
          { id: '081004', nombre: 'Colcha' },
          { id: '081005', nombre: 'Huanoquite' },
          { id: '081006', nombre: 'Omacha' },
          { id: '081007', nombre: 'Paccaritambo' },
          { id: '081008', nombre: 'Pillpinto' },
          { id: '081009', nombre: 'Yaurisque' }
        ]
      },
      {
        id: '0811',
        nombre: 'Paucartambo',
        distritos: [
          { id: '081101', nombre: 'Paucartambo' },
          { id: '081102', nombre: 'Caicay' },
          { id: '081103', nombre: 'Challabamba' },
          { id: '081104', nombre: 'Colquepata' },
          { id: '081105', nombre: 'Huancarani' },
          { id: '081106', nombre: 'Kosñipata' }
        ]
      },
      {
        id: '0812',
        nombre: 'Quispicanchi',
        distritos: [
          { id: '081201', nombre: 'Urcos' },
          { id: '081202', nombre: 'Andahuaylillas' },
          { id: '081203', nombre: 'Camanti' },
          { id: '081204', nombre: 'Ccarhuayo' },
          { id: '081205', nombre: 'Ccatca' },
          { id: '081206', nombre: 'Cusipata' },
          { id: '081207', nombre: 'Huaro' },
          { id: '081208', nombre: 'Lucre' },
          { id: '081209', nombre: 'Marcapata' },
          { id: '081210', nombre: 'Ocongate' },
          { id: '081211', nombre: 'Oropesa' },
          { id: '081212', nombre: 'Quiquijana' }
        ]
      },
      {
        id: '0813',
        nombre: 'Urubamba',
        distritos: [
          { id: '081301', nombre: 'Urubamba' },
          { id: '081302', nombre: 'Chinchero' },
          { id: '081303', nombre: 'Huayllabamba' },
          { id: '081304', nombre: 'Machupicchu' },
          { id: '081305', nombre: 'Maras' },
          { id: '081306', nombre: 'Ollantaytambo' },
          { id: '081307', nombre: 'Yucay' }
        ]
      }
    ]
  },
  {
    id: '09',
    nombre: 'Huancavelica',
    provincias: [
      {
        id: '0901',
        nombre: 'Huancavelica',
        distritos: [
          { id: '090101', nombre: 'Huancavelica' },
          { id: '090102', nombre: 'Acobambilla' },
          { id: '090103', nombre: 'Acoria' },
          { id: '090104', nombre: 'Conayca' },
          { id: '090105', nombre: 'Cuenca' },
          { id: '090106', nombre: 'Huachocolpa' },
          { id: '090107', nombre: 'Huayllahuara' },
          { id: '090108', nombre: 'Izcuchaca' },
          { id: '090109', nombre: 'Laria' },
          { id: '090110', nombre: 'Manta' },
          { id: '090111', nombre: 'Mariscal Cáceres' },
          { id: '090112', nombre: 'Moya' },
          { id: '090113', nombre: 'Nuevo Occoro' },
          { id: '090114', nombre: 'Palca' },
          { id: '090115', nombre: 'Pilchaca' },
          { id: '090116', nombre: 'Vilca' },
          { id: '090117', nombre: 'Yauli' },
          { id: '090118', nombre: 'Ascensión' },
          { id: '090119', nombre: 'Huando' }
        ]
      },
      {
        id: '0902',
        nombre: 'Acobamba',
        distritos: [
          { id: '090201', nombre: 'Acobamba' },
          { id: '090202', nombre: 'Andabamba' },
          { id: '090203', nombre: 'Anta' },
          { id: '090204', nombre: 'Caja' },
          { id: '090205', nombre: 'Marcas' },
          { id: '090206', nombre: 'Paucará' },
          { id: '090207', nombre: 'Pomacocha' },
          { id: '090208', nombre: 'Rosario' }
        ]
      },
      {
        id: '0903',
        nombre: 'Angaraes',
        distritos: [
          { id: '090301', nombre: 'Lircay' },
          { id: '090302', nombre: 'Anchonga' },
          { id: '090303', nombre: 'Callanmarca' },
          { id: '090304', nombre: 'Ccochaccasa' },
          { id: '090305', nombre: 'Chincho' },
          { id: '090306', nombre: 'Congalla' },
          { id: '090307', nombre: 'Huanca-Huanca' },
          { id: '090308', nombre: 'Huayllay Grande' },
          { id: '090309', nombre: 'Julcamarca' },
          { id: '090310', nombre: 'San Antonio de Antaparco' },
          { id: '090311', nombre: 'Santo Tomás de Pata' },
          { id: '090312', nombre: 'Secclla' }
        ]
      },
      {
        id: '0904',
        nombre: 'Castrovirreyna',
        distritos: [
          { id: '090401', nombre: 'Castrovirreyna' },
          { id: '090402', nombre: 'Arma' },
          { id: '090403', nombre: 'Aurahua' },
          { id: '090404', nombre: 'Capillas' },
          { id: '090405', nombre: 'Chupamarca' },
          { id: '090406', nombre: 'Cocas' },
          { id: '090407', nombre: 'Huachos' },
          { id: '090408', nombre: 'Huamatambo' },
          { id: '090409', nombre: 'Mollepampa' },
          { id: '090410', nombre: 'San Juan' },
          { id: '090411', nombre: 'Santa Ana' },
          { id: '090412', nombre: 'Tantara' },
          { id: '090413', nombre: 'Ticrapo' }
        ]
      },
      {
        id: '0905',
        nombre: 'Churcampa',
        distritos: [
          { id: '090501', nombre: 'Churcampa' },
          { id: '090502', nombre: 'Anco' },
          { id: '090503', nombre: 'Chinchihuasi' },
          { id: '090504', nombre: 'El Carmen' },
          { id: '090505', nombre: 'La Merced' },
          { id: '090506', nombre: 'Locroja' },
          { id: '090507', nombre: 'Paucarbamba' },
          { id: '090508', nombre: 'San Miguel de Mayocc' },
          { id: '090509', nombre: 'San Pedro de Coris' },
          { id: '090510', nombre: 'Pachamarca' }
        ]
      },
      {
        id: '0906',
        nombre: 'Huaytará',
        distritos: [
          { id: '090601', nombre: 'Huaytará' },
          { id: '090602', nombre: 'Ayavi' },
          { id: '090603', nombre: 'Córdova' },
          { id: '090604', nombre: 'Huayacundo Arma' },
          { id: '090605', nombre: 'Laramarca' },
          { id: '090606', nombre: 'Ocoyo' },
          { id: '090607', nombre: 'Pilpichaca' },
          { id: '090608', nombre: 'Querco' },
          { id: '090609', nombre: 'Quito-Arma' },
          { id: '090610', nombre: 'San Antonio de Cusicancha' },
          { id: '090611', nombre: 'San Francisco de Sangayaico' },
          { id: '090612', nombre: 'San Isidro' },
          { id: '090613', nombre: 'Santiago de Chocorvos' },
          { id: '090614', nombre: 'Santiago de Quirahuara' },
          { id: '090615', nombre: 'Santo Domingo de Capillas' },
          { id: '090616', nombre: 'Tambo' }
        ]
      },
      {
        id: '0907',
        nombre: 'Tayacaja',
        distritos: [
          { id: '090701', nombre: 'Pampas' },
          { id: '090702', nombre: 'Acostambo' },
          { id: '090703', nombre: 'Acraquia' },
          { id: '090704', nombre: 'Ahuaycha' },
          { id: '090705', nombre: 'Colcabamba' },
          { id: '090706', nombre: 'Daniel Hernández' },
          { id: '090707', nombre: 'Huachocolpa' },
          { id: '090708', nombre: 'Huaribamba' },
          { id: '090709', nombre: 'Ñahuimpuquio' },
          { id: '090710', nombre: 'Pazos' },
          { id: '090711', nombre: 'Quishuar' },
          { id: '090712', nombre: 'Salcabamba' },
          { id: '090713', nombre: 'Salcahuasi' },
          { id: '090714', nombre: 'San Marcos de Rocchac' },
          { id: '090715', nombre: 'Surcubamba' },
          { id: '090716', nombre: 'Tintay Puncu' }
        ]
      }
    ]
  },
  {
    id: '10',
    nombre: 'Huánuco',
    provincias: [
      {
        id: '1001',
        nombre: 'Huánuco',
        distritos: [
          { id: '100101', nombre: 'Huánuco' },
          { id: '100102', nombre: 'Amarilis' },
          { id: '100103', nombre: 'Chinchao' },
          { id: '100104', nombre: 'Churubamba' },
          { id: '100105', nombre: 'Margos' },
          { id: '100106', nombre: 'Quisqui' },
          { id: '100107', nombre: 'San Francisco de Cayrán' },
          { id: '100108', nombre: 'San Pedro de Chaulán' },
          { id: '100109', nombre: 'Santa María del Valle' },
          { id: '100110', nombre: 'Yarumayo' },
          { id: '100111', nombre: 'Pillco Marca' },
          { id: '100112', nombre: 'Yacus' },
          { id: '100113', nombre: 'Conchamarca' }
        ]
      },
      {
        id: '1002',
        nombre: 'Ambo',
        distritos: [
          { id: '100201', nombre: 'Ambo' },
          { id: '100202', nombre: 'Cayna' },
          { id: '100203', nombre: 'Colpas' },
          { id: '100204', nombre: 'Conchamarca' },
          { id: '100205', nombre: 'Huacar' },
          { id: '100206', nombre: 'San Francisco' },
          { id: '100207', nombre: 'San Rafael' },
          { id: '100208', nombre: 'Tomay Kichwa' }
        ]
      },
      {
        id: '1003',
        nombre: 'Dos de Mayo',
        distritos: [
          { id: '100301', nombre: 'La Unión' },
          { id: '100302', nombre: 'Chuquis' },
          { id: '100303', nombre: 'Marias' },
          { id: '100304', nombre: 'Pachas' },
          { id: '100305', nombre: 'Quivilla' },
          { id: '100306', nombre: 'Ripán' },
          { id: '100307', nombre: 'Shunqui' },
          { id: '100308', nombre: 'Sillapata' },
          { id: '100309', nombre: 'Yanas' }
        ]
      },
      {
        id: '1004',
        nombre: 'Huacaybamba',
        distritos: [
          { id: '100401', nombre: 'Huacaybamba' },
          { id: '100402', nombre: 'Canchabamba' },
          { id: '100403', nombre: 'Cochabamba' },
          { id: '100404', nombre: 'Pinra' }
        ]
      },
      {
        id: '1005',
        nombre: 'Huamalíes',
        distritos: [
          { id: '100501', nombre: 'Llata' },
          { id: '100502', nombre: 'Arancay' },
          { id: '100503', nombre: 'Chavín de Pariarca' },
          { id: '100504', nombre: 'Jacas Grande' },
          { id: '100505', nombre: 'Jircan' },
          { id: '100506', nombre: 'Miraflores' },
          { id: '100507', nombre: 'Monzón' },
          { id: '100508', nombre: 'Punchao' },
          { id: '100509', nombre: 'Puños' },
          { id: '100510', nombre: 'Singa' },
          { id: '100511', nombre: 'Tantamayo' }
        ]
      },
      {
        id: '1006',
        nombre: 'Leoncio Prado',
        distritos: [
          { id: '100601', nombre: 'Rupa Rupa' },
          { id: '100602', nombre: 'Daniel Alomías Robles' },
          { id: '100603', nombre: 'Hermilio Valdizán' },
          { id: '100604', nombre: 'José Crespo y Castillo' },
          { id: '100605', nombre: 'Luyando' },
          { id: '100606', nombre: 'Mariano Dámaso Beraun' },
          { id: '100607', nombre: 'Pucayacu' },
          { id: '100608', nombre: 'Castillo Grande' },
          { id: '100609', nombre: 'Pueblo Nuevo' },
          { id: '100610', nombre: 'Santo Domingo de Anda' }
        ]
      },
      {
        id: '1007',
        nombre: 'Marañón',
        distritos: [
          { id: '100701', nombre: 'Huacrachuco' },
          { id: '100702', nombre: 'Cholon' },
          { id: '100703', nombre: 'San Buenaventura' }
        ]
      },
      {
        id: '1008',
        nombre: 'Pachitea',
        distritos: [
          { id: '100801', nombre: 'Panao' },
          { id: '100802', nombre: 'Chaglla' },
          { id: '100803', nombre: 'Molino' },
          { id: '100804', nombre: 'Umari' }
        ]
      },
      {
        id: '1009',
        nombre: 'Puerto Inca',
        distritos: [
          { id: '100901', nombre: 'Puerto Inca' },
          { id: '100902', nombre: 'Codo del Pozuzo' },
          { id: '100903', nombre: 'Honoria' },
          { id: '100904', nombre: 'Tournavista' },
          { id: '100905', nombre: 'Yuyapichis' }
        ]
      },
      {
        id: '1010',
        nombre: 'Lauricocha',
        distritos: [
          { id: '101001', nombre: 'Jesús' },
          { id: '101002', nombre: 'Baños' },
          { id: '101003', nombre: 'Jivia' },
          { id: '101004', nombre: 'Queropalca' },
          { id: '101005', nombre: 'Rondos' },
          { id: '101006', nombre: 'San Francisco de Asís' },
          { id: '101007', nombre: 'San Miguel de Cauri' }
        ]
      },
      {
        id: '1011',
        nombre: 'Yarowilca',
        distritos: [
          { id: '101101', nombre: 'Chavinillo' },
          { id: '101102', nombre: 'Cahuac' },
          { id: '101103', nombre: 'Chacabamba' },
          { id: '101104', nombre: 'Aparicio Pomares' },
          { id: '101105', nombre: 'Jacas Chico' },
          { id: '101106', nombre: 'Obas' },
          { id: '101107', nombre: 'Pampamarca' },
          { id: '101108', nombre: 'Choras' }
        ]
      }
    ]
  },
  {
    id: '11',
    nombre: 'Ica',
    provincias: [
      {
        id: '1101',
        nombre: 'Ica',
        distritos: [
          { id: '110101', nombre: 'Ica' },
          { id: '110102', nombre: 'La Tinguiña' },
          { id: '110103', nombre: 'Los Aquijes' },
          { id: '110104', nombre: 'Ocucaje' },
          { id: '110105', nombre: 'Pachacutec' },
          { id: '110106', nombre: 'Parcona' },
          { id: '110107', nombre: 'Pueblo Nuevo' },
          { id: '110108', nombre: 'Salas' },
          { id: '110109', nombre: 'San José de los Molinos' },
          { id: '110110', nombre: 'San Juan Bautista' },
          { id: '110111', nombre: 'Santiago' },
          { id: '110112', nombre: 'Subtanjalla' },
          { id: '110113', nombre: 'Tate' },
          { id: '110114', nombre: 'Yauca del Rosario' }
        ]
      },
      {
        id: '1102',
        nombre: 'Chincha',
        distritos: [
          { id: '110201', nombre: 'Chincha Alta' },
          { id: '110202', nombre: 'Alto Larán' },
          { id: '110203', nombre: 'Chavín' },
          { id: '110204', nombre: 'Chincha Baja' },
          { id: '110205', nombre: 'El Carmen' },
          { id: '110206', nombre: 'Grocio Prado' },
          { id: '110207', nombre: 'Pueblo Nuevo' },
          { id: '110208', nombre: 'San Juan de Yanac' },
          { id: '110209', nombre: 'San Pedro de Huacarpana' },
          { id: '110210', nombre: 'Sunampe' },
          { id: '110211', nombre: 'Tambo de Mora' }
        ]
      },
      {
        id: '1103',
        nombre: 'Nasca',
        distritos: [
          { id: '110301', nombre: 'Nasca' },
          { id: '110302', nombre: 'Changuillo' },
          { id: '110303', nombre: 'El Ingenio' },
          { id: '110304', nombre: 'Marcona' },
          { id: '110305', nombre: 'Vista Alegre' }
        ]
      },
      {
        id: '1104',
        nombre: 'Palpa',
        distritos: [
          { id: '110401', nombre: 'Palpa' },
          { id: '110402', nombre: 'Llipata' },
          { id: '110403', nombre: 'Río Grande' },
          { id: '110404', nombre: 'Santa Cruz' },
          { id: '110405', nombre: 'Tibillo' }
        ]
      },
      {
        id: '1105',
        nombre: 'Pisco',
        distritos: [
          { id: '110501', nombre: 'Pisco' },
          { id: '110502', nombre: 'Huancano' },
          { id: '110503', nombre: 'Humay' },
          { id: '110504', nombre: 'Independencia' },
          { id: '110505', nombre: 'Paracas' },
          { id: '110506', nombre: 'San Andrés' },
          { id: '110507', nombre: 'San Clemente' },
          { id: '110508', nombre: 'Tupac Amaru Inca' }
        ]
      }
    ]
  },
  {
    id: '12',
    nombre: 'Junín',
    provincias: [
      {
        id: '1201',
        nombre: 'Huancayo',
        distritos: [
          { id: '120101', nombre: 'Huancayo' },
          { id: '120102', nombre: 'Carhuacallanga' },
          { id: '120103', nombre: 'Chacapampa' },
          { id: '120104', nombre: 'Chicche' },
          { id: '120105', nombre: 'Chilca' },
          { id: '120106', nombre: 'Chongos Alto' },
          { id: '120107', nombre: 'Chupuro' },
          { id: '120108', nombre: 'Colca' },
          { id: '120109', nombre: 'Cullhuas' },
          { id: '120110', nombre: 'El Tambo' },
          { id: '120111', nombre: 'Huacrapuquio' },
          { id: '120112', nombre: 'Hualhuas' },
          { id: '120113', nombre: 'Huancán' },
          { id: '120114', nombre: 'Huasicancha' },
          { id: '120115', nombre: 'Huayucachi' },
          { id: '120116', nombre: 'Ingenio' },
          { id: '120117', nombre: 'Pariahuanca' },
          { id: '120118', nombre: 'Pilcomayo' },
          { id: '120119', nombre: 'Pucará' },
          { id: '120120', nombre: 'Quichuay' },
          { id: '120121', nombre: 'Quilcas' },
          { id: '120122', nombre: 'San Agustín' },
          { id: '120123', nombre: 'San Jerónimo de Tunán' },
          { id: '120124', nombre: 'San Pedro de Saño' },
          { id: '120125', nombre: 'Santo Domingo de Acobamba' },
          { id: '120126', nombre: 'Sapallanga' },
          { id: '120127', nombre: 'Sicaya' },
          { id: '120128', nombre: 'Viques' }
        ]
      },
      {
        id: '1202',
        nombre: 'Concepción',
        distritos: [
          { id: '120201', nombre: 'Concepción' },
          { id: '120202', nombre: 'Aco' },
          { id: '120203', nombre: 'Andamarca' },
          { id: '120204', nombre: 'Chambara' },
          { id: '120205', nombre: 'Cochas' },
          { id: '120206', nombre: 'Comas' },
          { id: '120207', nombre: 'Heroínas Toledo' },
          { id: '120208', nombre: 'Manzanares' },
          { id: '120209', nombre: 'Mariscal Castilla' },
          { id: '120210', nombre: 'Matahuasi' },
          { id: '120211', nombre: 'Mito' },
          { id: '120212', nombre: 'Nueve de Julio' },
          { id: '120213', nombre: 'Orcotuna' },
          { id: '120214', nombre: 'San José de Quero' },
          { id: '120215', nombre: 'Santa Rosa de Ocopa' }
        ]
      },
      {
        id: '1203',
        nombre: 'Chanchamayo',
        distritos: [
          { id: '120301', nombre: 'Chanchamayo' },
          { id: '120302', nombre: 'Perené' },
          { id: '120303', nombre: 'Pichanaqui' },
          { id: '120304', nombre: 'San Luis de Shuaro' },
          { id: '120305', nombre: 'San Ramón' },
          { id: '120306', nombre: 'Vitoc' }
        ]
      },
      {
        id: '1204',
        nombre: 'Jauja',
        distritos: [
          { id: '120401', nombre: 'Jauja' },
          { id: '120402', nombre: 'Acolla' },
          { id: '120403', nombre: 'Apata' },
          { id: '120404', nombre: 'Ataura' },
          { id: '120405', nombre: 'Canchayllo' },
          { id: '120406', nombre: 'Curicaca' },
          { id: '120407', nombre: 'El Mantaro' },
          { id: '120408', nombre: 'Huamali' },
          { id: '120409', nombre: 'Huaripampa' },
          { id: '120410', nombre: 'Huertas' },
          { id: '120411', nombre: 'Janjaillo' },
          { id: '120412', nombre: 'Julcán' },
          { id: '120413', nombre: 'Leonor Ordóñez' },
          { id: '120414', nombre: 'Llocllapampa' },
          { id: '120415', nombre: 'Marco' },
          { id: '120416', nombre: 'Masma' },
          { id: '120417', nombre: 'Masma Chicche' },
          { id: '120418', nombre: 'Molinos' },
          { id: '120419', nombre: 'Monobamba' },
          { id: '120420', nombre: 'Muqui' },
          { id: '120421', nombre: 'Muquiyauyo' },
          { id: '120422', nombre: 'Paca' },
          { id: '120423', nombre: 'Paccha' },
          { id: '120424', nombre: 'Pancán' },
          { id: '120425', nombre: 'Parco' },
          { id: '120426', nombre: 'Pomacancha' },
          { id: '120427', nombre: 'Ricran' },
          { id: '120428', nombre: 'San Lorenzo' },
          { id: '120429', nombre: 'San Pedro de Chunan' },
          { id: '120430', nombre: 'Sausa' },
          { id: '120431', nombre: 'Sincos' },
          { id: '120432', nombre: 'Tunan Marca' },
          { id: '120433', nombre: 'Yauli' },
          { id: '120434', nombre: 'Yauyos' }
        ]
      },
      {
        id: '1205',
        nombre: 'Junín',
        distritos: [
          { id: '120501', nombre: 'Junín' },
          { id: '120502', nombre: 'Carhuamayo' },
          { id: '120503', nombre: 'Ondores' },
          { id: '120504', nombre: 'Ulcumayo' }
        ]
      },
      {
        id: '1206',
        nombre: 'Satipo',
        distritos: [
          { id: '120601', nombre: 'Satipo' },
          { id: '120602', nombre: 'Coviriali' },
          { id: '120603', nombre: 'Llaylla' },
          { id: '120604', nombre: 'Mazamari' },
          { id: '120605', nombre: 'Pampa Hermosa' },
          { id: '120606', nombre: 'Pantacocha' },
          { id: '120607', nombre: 'Río Negro' },
          { id: '120608', nombre: 'Río Tambo' },
          { id: '120609', nombre: 'Vizcatán del Ene' }
        ]
      },
      {
        id: '1207',
        nombre: 'Tarma',
        distritos: [
          { id: '120701', nombre: 'Tarma' },
          { id: '120702', nombre: 'Acobamba' },
          { id: '120703', nombre: 'Huaricolca' },
          { id: '120704', nombre: 'Huasahuasi' },
          { id: '120705', nombre: 'La Unión' },
          { id: '120706', nombre: 'Palca' },
          { id: '120707', nombre: 'Palcamayo' },
          { id: '120708', nombre: 'San Pedro de Cajas' },
          { id: '120709', nombre: 'Tapo' }
        ]
      },
      {
        id: '1208',
        nombre: 'Yauli',
        distritos: [
          { id: '120801', nombre: 'La Oroya' },
          { id: '120802', nombre: 'Chacapalpa' },
          { id: '120803', nombre: 'Huay-Huay' },
          { id: '120804', nombre: 'Marcapomacocha' },
          { id: '120805', nombre: 'Morococha' },
          { id: '120806', nombre: 'Paccha' },
          { id: '120807', nombre: 'Santa Bárbara de Carhuacayan' },
          { id: '120808', nombre: 'Santa Rosa de Sacco' },
          { id: '120809', nombre: 'Suitucancha' },
          { id: '120810', nombre: 'Yauli' }
        ]
      },
      {
        id: '1209',
        nombre: 'Chupaca',
        distritos: [
          { id: '120901', nombre: 'Chupaca' },
          { id: '120902', nombre: 'Ahuac' },
          { id: '120903', nombre: 'Chongos Bajo' },
          { id: '120904', nombre: 'Huachac' },
          { id: '120905', nombre: 'Huamancaca Chico' },
          { id: '120906', nombre: 'San Juan de Yscos' },
          { id: '120907', nombre: 'San Juan de Jarpa' },
          { id: '120908', nombre: 'Tres de Diciembre' },
          { id: '120909', nombre: 'Yanacancha' }
        ]
      }
    ]
  },
  {
    id: '13',
    nombre: 'La Libertad',
    provincias: [
      {
        id: '1301',
        nombre: 'Trujillo',
        distritos: [
          { id: '130101', nombre: 'Trujillo' },
          { id: '130102', nombre: 'El Porvenir' },
          { id: '130103', nombre: 'Florencia de Mora' },
          { id: '130104', nombre: 'Huanchaco' },
          { id: '130105', nombre: 'La Esperanza' },
          { id: '130106', nombre: 'Laredo' },
          { id: '130107', nombre: 'Moche' },
          { id: '130108', nombre: 'Poroto' },
          { id: '130109', nombre: 'Salaverry' },
          { id: '130110', nombre: 'Simbal' },
          { id: '130111', nombre: 'Víctor Larco Herrera' }
        ]
      },
      {
        id: '1302',
        nombre: 'Ascope',
        distritos: [
          { id: '130201', nombre: 'Ascope' },
          { id: '130202', nombre: 'Chicama' },
          { id: '130203', nombre: 'Chocope' },
          { id: '130204', nombre: 'Magdalena de Cao' },
          { id: '130205', nombre: 'Paiján' },
          { id: '130206', nombre: 'Rázuri' },
          { id: '130207', nombre: 'Santiago de Cao' },
          { id: '130208', nombre: 'Casa Grande' }
        ]
      },
      {
        id: '1303',
        nombre: 'Bolívar',
        distritos: [
          { id: '130301', nombre: 'Bolívar' },
          { id: '130302', nombre: 'Bambamarca' },
          { id: '130303', nombre: 'Condormarca' },
          { id: '130304', nombre: 'Longotea' },
          { id: '130305', nombre: 'Uchumarca' },
          { id: '130306', nombre: 'Ucuncha' }
        ]
      },
      {
        id: '1304',
        nombre: 'Chepén',
        distritos: [
          { id: '130401', nombre: 'Chepén' },
          { id: '130402', nombre: 'Pacanga' },
          { id: '130403', nombre: 'Pueblo Nuevo' }
        ]
      },
      {
        id: '1305',
        nombre: 'Julcán',
        distritos: [
          { id: '130501', nombre: 'Julcán' },
          { id: '130502', nombre: 'Carabamba' },
          { id: '130503', nombre: 'Casa Grande' }, // Nota: Casa Grande podría estar repetido
          { id: '130504', nombre: 'Huaso' } // Corrección: Calamarca? Ajustar
        ]
      },
      {
        id: '1306',
        nombre: 'Otuzco',
        distritos: [
          { id: '130601', nombre: 'Otuzco' },
          { id: '130602', nombre: 'Agallpampa' },
          { id: '130603', nombre: 'Charat' },
          { id: '130604', nombre: 'Huaranchal' },
          { id: '130605', nombre: 'La Cuesta' },
          { id: '130606', nombre: 'Mache' },
          { id: '130607', nombre: 'Paranday' },
          { id: '130608', nombre: 'Salpo' },
          { id: '130609', nombre: 'Sinsicap' },
          { id: '130610', nombre: 'Usquil' }
        ]
      },
      {
        id: '1307',
        nombre: 'Pacasmayo',
        distritos: [
          { id: '130701', nombre: 'San Pedro de Lloc' },
          { id: '130702', nombre: 'Guadalupe' },
          { id: '130703', nombre: 'Jequetepeque' },
          { id: '130704', nombre: 'Pacasmayo' },
          { id: '130705', nombre: 'San José' }
        ]
      },
      {
        id: '1308',
        nombre: 'Pataz',
        distritos: [
          { id: '130801', nombre: 'Tayabamba' },
          { id: '130802', nombre: 'Buldibuyo' },
          { id: '130803', nombre: 'Chillia' },
          { id: '130804', nombre: 'Huancaspata' },
          { id: '130805', nombre: 'Huaylillas' },
          { id: '130806', nombre: 'Huayo' },
          { id: '130807', nombre: 'Ongón' },
          { id: '130808', nombre: 'Parcoy' },
          { id: '130809', nombre: 'Pataz' },
          { id: '130810', nombre: 'Pías' },
          { id: '130811', nombre: 'Santiago de Challas' },
          { id: '130812', nombre: 'Taurija' },
          { id: '130813', nombre: 'Urpay' }
        ]
      },
      {
        id: '1309',
        nombre: 'Sánchez Carrión',
        distritos: [
          { id: '130901', nombre: 'Huamachuco' },
          { id: '130902', nombre: 'Chugay' },
          { id: '130903', nombre: 'Cochorco' },
          { id: '130904', nombre: 'Curgos' },
          { id: '130905', nombre: 'Marcabal' },
          { id: '130906', nombre: 'Sanagorán' },
          { id: '130907', nombre: 'Sarín' },
          { id: '130908', nombre: 'Sartimbamba' }
        ]
      },
      {
        id: '1310',
        nombre: 'Santiago de Chuco',
        distritos: [
          { id: '131001', nombre: 'Santiago de Chuco' },
          { id: '131002', nombre: 'Angasmarca' },
          { id: '131003', nombre: 'Cachicadán' },
          { id: '131004', nombre: 'Mollebamba' },
          { id: '131005', nombre: 'Mollepata' },
          { id: '131006', nombre: 'Quiruvilca' },
          { id: '131007', nombre: 'Santa Cruz de Chuca' },
          { id: '131008', nombre: 'Sitabamba' }
        ]
      },
      {
        id: '1311',
        nombre: 'Gran Chimú',
        distritos: [
          { id: '131101', nombre: 'Cascas' },
          { id: '131102', nombre: 'Lucma' },
          { id: '131103', nombre: 'Marmot' },
          { id: '131104', nombre: 'Sayapullo' }
        ]
      },
      {
        id: '1312',
        nombre: 'Virú',
        distritos: [
          { id: '131201', nombre: 'Virú' },
          { id: '131202', nombre: 'Chao' },
          { id: '131203', nombre: 'Guadalupito' }
        ]
      }
    ]
  },
  {
    id: '14',
    nombre: 'Lambayeque',
    provincias: [
      {
        id: '1401',
        nombre: 'Chiclayo',
        distritos: [
          { id: '140101', nombre: 'Chiclayo' },
          { id: '140102', nombre: 'Cayalti' },
          { id: '140103', nombre: 'Chongoyape' },
          { id: '140104', nombre: 'Eten' },
          { id: '140105', nombre: 'Eten Puerto' },
          { id: '140106', nombre: 'José Leonardo Ortiz' },
          { id: '140107', nombre: 'La Victoria' },
          { id: '140108', nombre: 'Lagunas' },
          { id: '140109', nombre: 'Monsefú' },
          { id: '140110', nombre: 'Nueva Arica' },
          { id: '140111', nombre: 'Oyotún' },
          { id: '140112', nombre: 'Picsi' },
          { id: '140113', nombre: 'Pimentel' },
          { id: '140114', nombre: 'Reque' },
          { id: '140115', nombre: 'Santa Rosa' },
          { id: '140116', nombre: 'Saña' },
          { id: '140117', nombre: 'Pátapo' },
          { id: '140118', nombre: 'Pomalca' },
          { id: '140119', nombre: 'Pucalá' },
          { id: '140120', nombre: 'Tumán' }
        ]
      },
      {
        id: '1402',
        nombre: 'Ferreñafe',
        distritos: [
          { id: '140201', nombre: 'Ferreñafe' },
          { id: '140202', nombre: 'Cañaris' },
          { id: '140203', nombre: 'Incahuasi' },
          { id: '140204', nombre: 'Manuel Antonio Mesones Muro' },
          { id: '140205', nombre: 'Pitipo' },
          { id: '140206', nombre: 'Pueblo Nuevo' }
        ]
      },
      {
        id: '1403',
        nombre: 'Lambayeque',
        distritos: [
          { id: '140301', nombre: 'Lambayeque' },
          { id: '140302', nombre: 'Chóchope' },
          { id: '140303', nombre: 'Illimo' },
          { id: '140304', nombre: 'Jayanca' },
          { id: '140305', nombre: 'Mochumi' },
          { id: '140306', nombre: 'Mórrope' },
          { id: '140307', nombre: 'Motupe' },
          { id: '140308', nombre: 'Olmos' },
          { id: '140309', nombre: 'Pacora' },
          { id: '140310', nombre: 'Salas' },
          { id: '140311', nombre: 'San José' },
          { id: '140312', nombre: 'Túcume' }
        ]
      }
    ]
  },
  {
    id: '15',
    nombre: 'Lima',
    provincias: [
      {
        id: '1501',
        nombre: 'Lima',
        distritos: [
          { id: '150101', nombre: 'Lima' },
          { id: '150102', nombre: 'Ancón' },
          { id: '150103', nombre: 'Ate' },
          { id: '150104', nombre: 'Barranco' },
          { id: '150105', nombre: 'Breña' },
          { id: '150106', nombre: 'Carabayllo' },
          { id: '150107', nombre: 'Chaclacayo' },
          { id: '150108', nombre: 'Chorrillos' },
          { id: '150109', nombre: 'Cieneguilla' },
          { id: '150110', nombre: 'Comas' },
          { id: '150111', nombre: 'El Agustino' },
          { id: '150112', nombre: 'Independencia' },
          { id: '150113', nombre: 'Jesús María' },
          { id: '150114', nombre: 'La Molina' },
          { id: '150115', nombre: 'La Victoria' },
          { id: '150116', nombre: 'Lince' },
          { id: '150117', nombre: 'Los Olivos' },
          { id: '150118', nombre: 'Lurigancho' },
          { id: '150119', nombre: 'Lurín' },
          { id: '150120', nombre: 'Magdalena del Mar' },
          { id: '150121', nombre: 'Miraflores' },
          { id: '150122', nombre: 'Pachacámac' },
          { id: '150123', nombre: 'Pucusana' },
          { id: '150124', nombre: 'Puente Piedra' },
          { id: '150125', nombre: 'Punta Hermosa' },
          { id: '150126', nombre: 'Punta Negra' },
          { id: '150127', nombre: 'Rímac' },
          { id: '150128', nombre: 'San Bartolo' },
          { id: '150129', nombre: 'San Borja' },
          { id: '150130', nombre: 'San Isidro' },
          { id: '150131', nombre: 'San Juan de Lurigancho' },
          { id: '150132', nombre: 'San Juan de Miraflores' },
          { id: '150133', nombre: 'San Luis' },
          { id: '150134', nombre: 'San Martín de Porres' },
          { id: '150135', nombre: 'San Miguel' },
          { id: '150136', nombre: 'Santa Anita' },
          { id: '150137', nombre: 'Santa María del Mar' },
          { id: '150138', nombre: 'Santa Rosa' },
          { id: '150139', nombre: 'Santiago de Surco' },
          { id: '150140', nombre: 'Surquillo' },
          { id: '150141', nombre: 'Villa El Salvador' },
          { id: '150142', nombre: 'Villa María del Triunfo' }
        ]
      },
      {
        id: '1502',
        nombre: 'Barranca',
        distritos: [
          { id: '150201', nombre: 'Barranca' },
          { id: '150202', nombre: 'Paramonga' },
          { id: '150203', nombre: 'Pativilca' },
          { id: '150204', nombre: 'Supe' },
          { id: '150205', nombre: 'Supe Puerto' }
        ]
      },
      {
        id: '1503',
        nombre: 'Cajatambo',
        distritos: [
          { id: '150301', nombre: 'Cajatambo' },
          { id: '150302', nombre: 'Copa' },
          { id: '150303', nombre: 'Gorgor' },
          { id: '150304', nombre: 'Huancapón' },
          { id: '150305', nombre: 'Manas' }
        ]
      },
      {
        id: '1504',
        nombre: 'Canta',
        distritos: [
          { id: '150401', nombre: 'Canta' },
          { id: '150402', nombre: 'Arahuay' },
          { id: '150403', nombre: 'Huamantanga' },
          { id: '150404', nombre: 'Huaros' },
          { id: '150405', nombre: 'Lachaqui' },
          { id: '150406', nombre: 'San Buenaventura' },
          { id: '150407', nombre: 'Santa Rosa de Quives' }
        ]
      },
      {
        id: '1505',
        nombre: 'Cañete',
        distritos: [
          { id: '150501', nombre: 'San Vicente de Cañete' },
          { id: '150502', nombre: 'Asia' },
          { id: '150503', nombre: 'Calango' },
          { id: '150504', nombre: 'Cerro Azul' },
          { id: '150505', nombre: 'Chilca' },
          { id: '150506', nombre: 'Coayllo' },
          { id: '150507', nombre: 'Imperial' },
          { id: '150508', nombre: 'Lunahuaná' },
          { id: '150509', nombre: 'Mala' },
          { id: '150510', nombre: 'Nuevo Imperial' },
          { id: '150511', nombre: 'Pacarán' },
          { id: '150512', nombre: 'Quilmaná' },
          { id: '150513', nombre: 'San Antonio' },
          { id: '150514', nombre: 'San Luis' },
          { id: '150515', nombre: 'Santa Cruz de Flores' },
          { id: '150516', nombre: 'Zúñiga' }
        ]
      },
      {
        id: '1506',
        nombre: 'Huaral',
        distritos: [
          { id: '150601', nombre: 'Huaral' },
          { id: '150602', nombre: 'Atavillos Alto' },
          { id: '150603', nombre: 'Atavillos Bajo' },
          { id: '150604', nombre: 'Aucallama' },
          { id: '150605', nombre: 'Chancay' },
          { id: '150606', nombre: 'Ihuari' },
          { id: '150607', nombre: 'Lampian' },
          { id: '150608', nombre: 'Pacaraos' },
          { id: '150609', nombre: 'San Miguel de Acos' },
          { id: '150610', nombre: 'Santa Cruz de Andamarca' },
          { id: '150611', nombre: 'Sumbilca' },
          { id: '150612', nombre: 'Veintisiete de Noviembre' }
        ]
      },
      {
        id: '1507',
        nombre: 'Huarochirí',
        distritos: [
          { id: '150701', nombre: 'Matucana' },
          { id: '150702', nombre: 'Antioquia' },
          { id: '150703', nombre: 'Callahuanca' },
          { id: '150704', nombre: 'Carampoma' },
          { id: '150705', nombre: 'Chicla' },
          { id: '150706', nombre: 'Cuenca' },
          { id: '150707', nombre: 'Huachupampa' },
          { id: '150708', nombre: 'Huanza' },
          { id: '150709', nombre: 'Huarochirí' },
          { id: '150710', nombre: 'Lahuaytambo' },
          { id: '150711', nombre: 'Langa' },
          { id: '150712', nombre: 'Laraos' },
          { id: '150713', nombre: 'Mariatana' },
          { id: '150714', nombre: 'Ricardo Palma' },
          { id: '150715', nombre: 'San Andrés de Tupicocha' },
          { id: '150716', nombre: 'San Antonio' },
          { id: '150717', nombre: 'San Bartolomé' },
          { id: '150718', nombre: 'San Damian' },
          { id: '150719', nombre: 'San Juan de Iris' },
          { id: '150720', nombre: 'San Juan de Tantaranche' },
          { id: '150721', nombre: 'San Lorenzo de Quinti' },
          { id: '150722', nombre: 'San Mateo' },
          { id: '150723', nombre: 'San Mateo de Otao' },
          { id: '150724', nombre: 'San Pedro de Casta' },
          { id: '150725', nombre: 'San Pedro de Huancayre' },
          { id: '150726', nombre: 'Sangallaya' },
          { id: '150727', nombre: 'Santa Cruz de Cocachacra' },
          { id: '150728', nombre: 'Santa Eulalia' },
          { id: '150729', nombre: 'Santiago de Anchucaya' },
          { id: '150730', nombre: 'Santiago de Tuna' },
          { id: '150731', nombre: 'Santo Domingo de los Olleros' },
          { id: '150732', nombre: 'Surco' }
        ]
      },
      {
        id: '1508',
        nombre: 'Huaura',
        distritos: [
          { id: '150801', nombre: 'Huacho' },
          { id: '150802', nombre: 'Ambar' },
          { id: '150803', nombre: 'Caleta de Carquín' },
          { id: '150804', nombre: 'Checras' },
          { id: '150805', nombre: 'Hualmay' },
          { id: '150806', nombre: 'Huaura' },
          { id: '150807', nombre: 'Leoncio Prado' },
          { id: '150808', nombre: 'Paccho' },
          { id: '150809', nombre: 'Santa Leonor' },
          { id: '150810', nombre: 'Santa María' },
          { id: '150811', nombre: 'Sayan' },
          { id: '150812', nombre: 'Vegueta' }
        ]
      },
      {
        id: '1509',
        nombre: 'Oyón',
        distritos: [
          { id: '150901', nombre: 'Oyón' },
          { id: '150902', nombre: 'Andajes' },
          { id: '150903', nombre: 'Caujul' },
          { id: '150904', nombre: 'Cochamarca' },
          { id: '150905', nombre: 'Navan' },
          { id: '150906', nombre: 'Pachangara' }
        ]
      },
      {
        id: '1510',
        nombre: 'Yauyos',
        distritos: [
          { id: '151001', nombre: 'Yauyos' },
          { id: '151002', nombre: 'Alis' },
          { id: '151003', nombre: 'Ayauca' },
          { id: '151004', nombre: 'Ayaviri' },
          { id: '151005', nombre: 'Azángaro' },
          { id: '151006', nombre: 'Cacra' },
          { id: '151007', nombre: 'Carania' },
          { id: '151008', nombre: 'Catahuasi' },
          { id: '151009', nombre: 'Chocos' },
          { id: '151010', nombre: 'Cochas' },
          { id: '151011', nombre: 'Colonia' },
          { id: '151012', nombre: 'Hongos' },
          { id: '151013', nombre: 'Huampara' },
          { id: '151014', nombre: 'Huancaya' },
          { id: '151015', nombre: 'Huangascar' },
          { id: '151016', nombre: 'Huantán' },
          { id: '151017', nombre: 'Huañec' },
          { id: '151018', nombre: 'Laraos' },
          { id: '151019', nombre: 'Lincha' },
          { id: '151020', nombre: 'Madean' },
          { id: '151021', nombre: 'Miraflores' },
          { id: '151022', nombre: 'Omas' },
          { id: '151023', nombre: 'Putinza' },
          { id: '151024', nombre: 'Quinches' },
          { id: '151025', nombre: 'Quinocay' },
          { id: '151026', nombre: 'San Joaquín' },
          { id: '151027', nombre: 'San Pedro de Pilas' },
          { id: '151028', nombre: 'Tanta' },
          { id: '151029', nombre: 'Tauripampa' },
          { id: '151030', nombre: 'Tomás' },
          { id: '151031', nombre: 'Tupe' },
          { id: '151032', nombre: 'Viñac' },
          { id: '151033', nombre: 'Vitis' }
        ]
      }
    ]
  },
    {
    id: '16',
    nombre: 'Loreto',
    provincias: [
      {
        id: '1601',
        nombre: 'Maynas',
        distritos: [
          { id: '160101', nombre: 'Iquitos' },
          { id: '160102', nombre: 'Alto Nanay' },
          { id: '160103', nombre: 'Fernando Lores' },
          { id: '160104', nombre: 'Indiana' },
          { id: '160105', nombre: 'Las Amazonas' },
          { id: '160106', nombre: 'Mazán' },
          { id: '160107', nombre: 'Napo' },
          { id: '160108', nombre: 'Punchana' },
          { id: '160109', nombre: 'Putumayo' },
          { id: '160110', nombre: 'Torres Causana' },
          { id: '160111', nombre: 'Belén' },
          { id: '160112', nombre: 'San Juan Bautista' },
          { id: '160113', nombre: 'Teniente Manuel Clavero' }
        ]
      },
      {
        id: '1602',
        nombre: 'Alto Amazonas',
        distritos: [
          { id: '160201', nombre: 'Yurimaguas' },
          { id: '160202', nombre: 'Balsapuerto' },
          { id: '160203', nombre: 'Jeberos' },
          { id: '160204', nombre: 'Lagunas' },
          { id: '160205', nombre: 'Santa Cruz' },
          { id: '160206', nombre: 'Teniente Cesar López Rojas' }
        ]
      },
      {
        id: '1603',
        nombre: 'Loreto',
        distritos: [
          { id: '160301', nombre: 'Nauta' },
          { id: '160302', nombre: 'Parinari' },
          { id: '160303', nombre: 'Tigre' },
          { id: '160304', nombre: 'Trompeteros' },
          { id: '160305', nombre: 'Urarinas' }
        ]
      },
      {
        id: '1604',
        nombre: 'Mariscal Ramón Castilla',
        distritos: [
          { id: '160401', nombre: 'Caballococha' },
          { id: '160402', nombre: 'Pebas' },
          { id: '160403', nombre: 'Yavari' },
          { id: '160404', nombre: 'San Pablo' }
        ]
      },
      {
        id: '1605',
        nombre: 'Requena',
        distritos: [
          { id: '160501', nombre: 'Requena' },
          { id: '160502', nombre: 'Alto Tapiche' },
          { id: '160503', nombre: 'Capelo' },
          { id: '160504', nombre: 'Emiliano Herrera' },
          { id: '160505', nombre: 'Maquía' },
          { id: '160506', nombre: 'Puinahua' },
          { id: '160507', nombre: 'Saquena' },
          { id: '160508', nombre: 'Soplin' },
          { id: '160509', nombre: 'Tapiche' },
          { id: '160510', nombre: 'Jenaro Herrera' },
          { id: '160511', nombre: 'Yaquerana' }
        ]
      },
      {
        id: '1606',
        nombre: 'Ucayali',
        distritos: [
          { id: '160601', nombre: 'Contamana' },
          { id: '160602', nombre: 'Inahuaya' },
          { id: '160603', nombre: 'Padre Márquez' },
          { id: '160604', nombre: 'Pampa Hermosa' },
          { id: '160605', nombre: 'Sarayacu' },
          { id: '160606', nombre: 'Vargas Guerra' }
        ]
      },
      {
        id: '1607',
        nombre: 'Datem del Marañón',
        distritos: [
          { id: '160701', nombre: 'Barranca' },
          { id: '160702', nombre: 'Cahuapanas' },
          { id: '160703', nombre: 'Manseriche' },
          { id: '160704', nombre: 'Morona' },
          { id: '160705', nombre: 'Pastaza' },
          { id: '160706', nombre: 'Andoas' }
        ]
      },
      {
        id: '1608',
        nombre: 'Putumayo',
        distritos: [
          { id: '160801', nombre: 'Putumayo' },
          { id: '160802', nombre: 'Rosa Panduro' },
          { id: '160803', nombre: 'Teniente Manuel Clavero' }, // Nota: Puede estar repetido
          { id: '160804', nombre: 'Yaguas' }
        ]
      }
    ]
  },
  {
    id: '17',
    nombre: 'Madre de Dios',
    provincias: [
      {
        id: '1701',
        nombre: 'Tambopata',
        distritos: [
          { id: '170101', nombre: 'Tambopata' },
          { id: '170102', nombre: 'Inambari' },
          { id: '170103', nombre: 'Las Piedras' },
          { id: '170104', nombre: 'Laberinto' }
        ]
      },
      {
        id: '1702',
        nombre: 'Manu',
        distritos: [
          { id: '170201', nombre: 'Manu' },
          { id: '170202', nombre: 'Fitzcarrald' },
          { id: '170203', nombre: 'Madre de Dios' },
          { id: '170204', nombre: 'Huepetuhe' }
        ]
      },
      {
        id: '1703',
        nombre: 'Tahuamanu',
        distritos: [
          { id: '170301', nombre: 'Iñapari' },
          { id: '170302', nombre: 'Iberia' },
          { id: '170303', nombre: 'Tahuamanu' }
        ]
      }
    ]
  },
  {
    id: '18',
    nombre: 'Moquegua',
    provincias: [
      {
        id: '1801',
        nombre: 'Mariscal Nieto',
        distritos: [
          { id: '180101', nombre: 'Moquegua' },
          { id: '180102', nombre: 'Carumas' },
          { id: '180103', nombre: 'Cuchumbaya' },
          { id: '180104', nombre: 'Samegua' },
          { id: '180105', nombre: 'San Cristóbal' },
          { id: '180106', nombre: 'Torata' }
        ]
      },
      {
        id: '1802',
        nombre: 'General Sánchez Cerro',
        distritos: [
          { id: '180201', nombre: 'Omate' },
          { id: '180202', nombre: 'Chojata' },
          { id: '180203', nombre: 'Coalaque' },
          { id: '180204', nombre: 'Ichuña' },
          { id: '180205', nombre: 'La Capilla' },
          { id: '180206', nombre: 'Lloque' },
          { id: '180207', nombre: 'Matalaque' },
          { id: '180208', nombre: 'Puquina' },
          { id: '180209', nombre: 'Quinistaquillas' },
          { id: '180210', nombre: 'Ubinas' },
          { id: '180211', nombre: 'Yunga' }
        ]
      },
      {
        id: '1803',
        nombre: 'Ilo',
        distritos: [
          { id: '180301', nombre: 'Ilo' },
          { id: '180302', nombre: 'El Algarrobal' },
          { id: '180303', nombre: 'Pacocha' }
        ]
      }
    ]
  },
  {
    id: '19',
    nombre: 'Pasco',
    provincias: [
      {
        id: '1901',
        nombre: 'Pasco',
        distritos: [
          { id: '190101', nombre: 'Chaupimarca' },
          { id: '190102', nombre: 'Huachón' },
          { id: '190103', nombre: 'Huariaca' },
          { id: '190104', nombre: 'Huayllay' },
          { id: '190105', nombre: 'Ninacaca' },
          { id: '190106', nombre: 'Pallanchacra' },
          { id: '190107', nombre: 'Paucartambo' },
          { id: '190108', nombre: 'San Francisco de Asís de Yarusyacán' },
          { id: '190109', nombre: 'Simón Bolívar' },
          { id: '190110', nombre: 'Ticlacayán' },
          { id: '190111', nombre: 'Tinyahuarco' },
          { id: '190112', nombre: 'Vicco' },
          { id: '190113', nombre: 'Yanacancha' }
        ]
      },
      {
        id: '1902',
        nombre: 'Daniel Alcides Carrión',
        distritos: [
          { id: '190201', nombre: 'Yanahuanca' },
          { id: '190202', nombre: 'Chacayán' },
          { id: '190203', nombre: 'Goyllarisquizga' },
          { id: '190204', nombre: 'Paucar' },
          { id: '190205', nombre: 'San Pedro de Pillao' },
          { id: '190206', nombre: 'Santa Ana de Tusi' },
          { id: '190207', nombre: 'Tápuc' },
          { id: '190208', nombre: 'Vilcabamba' }
        ]
      },
      {
        id: '1903',
        nombre: 'Oxapampa',
        distritos: [
          { id: '190301', nombre: 'Oxapampa' },
          { id: '190302', nombre: 'Chontabamba' },
          { id: '190303', nombre: 'Huancabamba' },
          { id: '190304', nombre: 'Palcazu' },
          { id: '190305', nombre: 'Pozuzo' },
          { id: '190306', nombre: 'Puerto Bermúdez' },
          { id: '190307', nombre: 'Villa Rica' },
          { id: '190308', nombre: 'Constitución' }
        ]
      }
    ]
  },
  {
    id: '20',
    nombre: 'Piura',
    provincias: [
      {
        id: '2001',
        nombre: 'Piura',
        distritos: [
          { id: '200101', nombre: 'Piura' },
          { id: '200102', nombre: 'Castilla' },
          { id: '200103', nombre: 'Catacaos' },
          { id: '200104', nombre: 'Cura Mori' },
          { id: '200105', nombre: 'El Tallán' },
          { id: '200106', nombre: 'La Arena' },
          { id: '200107', nombre: 'La Unión' },
          { id: '200108', nombre: 'Las Lomas' },
          { id: '200109', nombre: 'Tambo Grande' },
          { id: '200110', nombre: 'Veintiséis de Octubre' }
        ]
      },
      {
        id: '2002',
        nombre: 'Ayabaca',
        distritos: [
          { id: '200201', nombre: 'Ayabaca' },
          { id: '200202', nombre: 'Frias' },
          { id: '200203', nombre: 'Jilili' },
          { id: '200204', nombre: 'Lagunas' },
          { id: '200205', nombre: 'Montero' },
          { id: '200206', nombre: 'Pacaipampa' },
          { id: '200207', nombre: 'Paimas' },
          { id: '200208', nombre: 'Sapillica' },
          { id: '200209', nombre: 'Sicchez' },
          { id: '200210', nombre: 'Suyo' }
        ]
      },
      {
        id: '2003',
        nombre: 'Huancabamba',
        distritos: [
          { id: '200301', nombre: 'Huancabamba' },
          { id: '200302', nombre: 'Canchaque' },
          { id: '200303', nombre: 'El Carmen de la Frontera' },
          { id: '200304', nombre: 'Huarmaca' },
          { id: '200305', nombre: 'Lalaquiz' },
          { id: '200306', nombre: 'San Miguel de El Faique' },
          { id: '200307', nombre: 'Sondor' },
          { id: '200308', nombre: 'Sondorillo' }
        ]
      },
      {
        id: '2004',
        nombre: 'Morropón',
        distritos: [
          { id: '200401', nombre: 'Chulucanas' },
          { id: '200402', nombre: 'Buenos Aires' },
          { id: '200403', nombre: 'Chalaco' },
          { id: '200404', nombre: 'La Matanza' },
          { id: '200405', nombre: 'Morropón' },
          { id: '200406', nombre: 'Salitral' },
          { id: '200407', nombre: 'San Juan de Bigote' },
          { id: '200408', nombre: 'Santa Catalina de Mossa' },
          { id: '200409', nombre: 'Santo Domingo' },
          { id: '200410', nombre: 'Yamango' }
        ]
      },
      {
        id: '2005',
        nombre: 'Paita',
        distritos: [
          { id: '200501', nombre: 'Paita' },
          { id: '200502', nombre: 'Amotape' },
          { id: '200503', nombre: 'Arenal' },
          { id: '200504', nombre: 'Colan' },
          { id: '200505', nombre: 'La Huaca' },
          { id: '200506', nombre: 'Tamarindo' },
          { id: '200507', nombre: 'Vichayal' }
        ]
      },
      {
        id: '2006',
        nombre: 'Sullana',
        distritos: [
          { id: '200601', nombre: 'Sullana' },
          { id: '200602', nombre: 'Bellavista' },
          { id: '200603', nombre: 'Ignacio Escudero' },
          { id: '200604', nombre: 'Lancones' },
          { id: '200605', nombre: 'Marcavelica' },
          { id: '200606', nombre: 'Miguel Checa' },
          { id: '200607', nombre: 'Querecotillo' },
          { id: '200608', nombre: 'Salitral' }
        ]
      },
      {
        id: '2007',
        nombre: 'Talara',
        distritos: [
          { id: '200701', nombre: 'Pariñas' },
          { id: '200702', nombre: 'El Alto' },
          { id: '200703', nombre: 'La Brea' },
          { id: '200704', nombre: 'Lobitos' },
          { id: '200705', nombre: 'Los Organos' },
          { id: '200706', nombre: 'Mancora' }
        ]
      },
      {
        id: '2008',
        nombre: 'Sechura',
        distritos: [
          { id: '200801', nombre: 'Sechura' },
          { id: '200802', nombre: 'Bellavista de la Unión' },
          { id: '200803', nombre: 'Bernal' },
          { id: '200804', nombre: 'Cristo Nos Valga' },
          { id: '200805', nombre: 'Vice' },
          { id: '200806', nombre: 'Rinconada Llicuar' }
        ]
      }
    ]
  },
  {
    id: '21',
    nombre: 'Puno',
    provincias: [
      {
        id: '2101',
        nombre: 'Puno',
        distritos: [
          { id: '210101', nombre: 'Puno' },
          { id: '210102', nombre: 'Acora' },
          { id: '210103', nombre: 'Amantani' },
          { id: '210104', nombre: 'Atuncolla' },
          { id: '210105', nombre: 'Capachica' },
          { id: '210106', nombre: 'Chucuito' },
          { id: '210107', nombre: 'Coata' },
          { id: '210108', nombre: 'Huata' },
          { id: '210109', nombre: 'Mañazo' },
          { id: '210110', nombre: 'Paucarcolla' },
          { id: '210111', nombre: 'Pichacani' },
          { id: '210112', nombre: 'Plateria' },
          { id: '210113', nombre: 'San Antonio' },
          { id: '210114', nombre: 'Tiquillaca' },
          { id: '210115', nombre: 'Vilque' }
        ]
      },
      {
        id: '2102',
        nombre: 'Azángaro',
        distritos: [
          { id: '210201', nombre: 'Azángaro' },
          { id: '210202', nombre: 'Achaya' },
          { id: '210203', nombre: 'Arapa' },
          { id: '210204', nombre: 'Asillo' },
          { id: '210205', nombre: 'Caminaca' },
          { id: '210206', nombre: 'Chupa' },
          { id: '210207', nombre: 'José Domingo Choquehuanca' },
          { id: '210208', nombre: 'Muñani' },
          { id: '210209', nombre: 'Potoni' },
          { id: '210210', nombre: 'Saman' },
          { id: '210211', nombre: 'San Antón' },
          { id: '210212', nombre: 'San José' },
          { id: '210213', nombre: 'San Juan de Salinas' },
          { id: '210214', nombre: 'Santiago de Pupuja' },
          { id: '210215', nombre: 'Tirapata' }
        ]
      },
      {
        id: '2103',
        nombre: 'Carabaya',
        distritos: [
          { id: '210301', nombre: 'Macusani' },
          { id: '210302', nombre: 'Ajoyani' },
          { id: '210303', nombre: 'Ayapata' },
          { id: '210304', nombre: 'Coasa' },
          { id: '210305', nombre: 'Corani' },
          { id: '210306', nombre: 'Crucero' },
          { id: '210307', nombre: 'Ituata' },
          { id: '210308', nombre: 'Ollachea' },
          { id: '210309', nombre: 'San Gaban' },
          { id: '210310', nombre: 'Usicayos' }
        ]
      },
      {
        id: '2104',
        nombre: 'Chucuito',
        distritos: [
          { id: '210401', nombre: 'Juli' },
          { id: '210402', nombre: 'Desaguadero' },
          { id: '210403', nombre: 'Huacullani' },
          { id: '210404', nombre: 'Kelluyo' },
          { id: '210405', nombre: 'Pisacoma' },
          { id: '210406', nombre: 'Pomata' },
          { id: '210407', nombre: 'Zepita' }
        ]
      },
      {
        id: '2105',
        nombre: 'El Collao',
        distritos: [
          { id: '210501', nombre: 'Ilave' },
          { id: '210502', nombre: 'Capazo' },
          { id: '210503', nombre: 'Pilcuyo' },
          { id: '210504', nombre: 'Santa Rosa' },
          { id: '210505', nombre: 'Conduriri' }
        ]
      },
      {
        id: '2106',
        nombre: 'Huancané',
        distritos: [
          { id: '210601', nombre: 'Huancané' },
          { id: '210602', nombre: 'Cojata' },
          { id: '210603', nombre: 'Huatasani' },
          { id: '210604', nombre: 'Inchupalla' },
          { id: '210605', nombre: 'Pusi' },
          { id: '210606', nombre: 'Rosaspata' },
          { id: '210607', nombre: 'Taraco' },
          { id: '210608', nombre: 'Vilque Chico' }
        ]
      },
      {
        id: '2107',
        nombre: 'Lampa',
        distritos: [
          { id: '210701', nombre: 'Lampa' },
          { id: '210702', nombre: 'Cabanilla' },
          { id: '210703', nombre: 'Calapuja' },
          { id: '210704', nombre: 'Nicasio' },
          { id: '210705', nombre: 'Ocuviri' },
          { id: '210706', nombre: 'Palca' },
          { id: '210707', nombre: 'Paratía' },
          { id: '210708', nombre: 'Pucará' },
          { id: '210709', nombre: 'Santa Lucía' },
          { id: '210710', nombre: 'Vilavila' }
        ]
      },
      {
        id: '2108',
        nombre: 'Melgar',
        distritos: [
          { id: '210801', nombre: 'Ayaviri' },
          { id: '210802', nombre: 'Antauta' },
          { id: '210803', nombre: 'Cupi' },
          { id: '210804', nombre: 'Llalli' },
          { id: '210805', nombre: 'Macari' },
          { id: '210806', nombre: 'Nuñoa' },
          { id: '210807', nombre: 'Orurillo' },
          { id: '210808', nombre: 'Santa Rosa' },
          { id: '210809', nombre: 'Umachiri' }
        ]
      },
      {
        id: '2109',
        nombre: 'Moho',
        distritos: [
          { id: '210901', nombre: 'Moho' },
          { id: '210902', nombre: 'Conima' },
          { id: '210903', nombre: 'Huayrapata' },
          { id: '210904', nombre: 'Tilali' }
        ]
      },
      {
        id: '2110',
        nombre: 'San Antonio de Putina',
        distritos: [
          { id: '211001', nombre: 'Putina' },
          { id: '211002', nombre: 'Ananea' },
          { id: '211003', nombre: 'Pedro Vilca Apaza' },
          { id: '211004', nombre: 'Quilcapuncu' },
          { id: '211005', nombre: 'Sina' }
        ]
      },
      {
        id: '2111',
        nombre: 'San Román',
        distritos: [
          { id: '211101', nombre: 'Juliaca' },
          { id: '211102', nombre: 'Cabana' },
          { id: '211103', nombre: 'Cabanillas' },
          { id: '211104', nombre: 'Caracoto' },
          { id: '211105', nombre: 'San Miguel' }
        ]
      },
      {
        id: '2112',
        nombre: 'Sandia',
        distritos: [
          { id: '211201', nombre: 'Sandia' },
          { id: '211202', nombre: 'Cuyocuyo' },
          { id: '211203', nombre: 'Limbani' },
          { id: '211204', nombre: 'Patambuco' },
          { id: '211205', nombre: 'Phara' },
          { id: '211206', nombre: 'Quiaca' },
          { id: '211207', nombre: 'San Juan del Oro' },
          { id: '211208', nombre: 'Yanahuaya' },
          { id: '211209', nombre: 'Alto Inambari' },
          { id: '211210', nombre: 'San Pedro de Putina Punco' }
        ]
      },
      {
        id: '2113',
        nombre: 'Yunguyo',
        distritos: [
          { id: '211301', nombre: 'Yunguyo' },
          { id: '211302', nombre: 'Anapia' },
          { id: '211303', nombre: 'Copani' },
          { id: '211304', nombre: 'Cuturapi' },
          { id: '211305', nombre: 'Ollaraya' },
          { id: '211306', nombre: 'Tinicachi' },
          { id: '211307', nombre: 'Unicachi' }
        ]
      }
    ]
  },
  {
    id: '22',
    nombre: 'San Martín',
    provincias: [
      {
        id: '2201',
        nombre: 'Moyobamba',
        distritos: [
          { id: '220101', nombre: 'Moyobamba' },
          { id: '220102', nombre: 'Calzada' },
          { id: '220103', nombre: 'Habana' },
          { id: '220104', nombre: 'Jepelacio' },
          { id: '220105', nombre: 'Soritor' },
          { id: '220106', nombre: 'Yantalo' }
        ]
      },
      {
        id: '2202',
        nombre: 'Bellavista',
        distritos: [
          { id: '220201', nombre: 'Bellavista' },
          { id: '220202', nombre: 'Alto Biavo' },
          { id: '220203', nombre: 'Bajo Biavo' },
          { id: '220204', nombre: 'Huallaga' },
          { id: '220205', nombre: 'San Pablo' },
          { id: '220206', nombre: 'San Rafael' }
        ]
      },
      {
        id: '2203',
        nombre: 'El Dorado',
        distritos: [
          { id: '220301', nombre: 'San José de Sisa' },
          { id: '220302', nombre: 'Agua Blanca' },
          { id: '220303', nombre: 'San Martín' },
          { id: '220304', nombre: 'Santa Rosa' },
          { id: '220305', nombre: 'Shatoja' }
        ]
      },
      {
        id: '2204',
        nombre: 'Huallaga',
        distritos: [
          { id: '220401', nombre: 'Saposoa' },
          { id: '220402', nombre: 'Alto Saposoa' },
          { id: '220403', nombre: 'El Eslabón' },
          { id: '220404', nombre: 'Piscoyacu' },
          { id: '220405', nombre: 'Sacanche' },
          { id: '220406', nombre: 'Tingo de Saposoa' }
        ]
      },
      {
        id: '2205',
        nombre: 'Lamas',
        distritos: [
          { id: '220501', nombre: 'Lamas' },
          { id: '220502', nombre: 'Alonso de Alvarado' },
          { id: '220503', nombre: 'Barranquita' },
          { id: '220504', nombre: 'Caynarachi' },
          { id: '220505', nombre: 'Cuñumbuqui' },
          { id: '220506', nombre: 'Pinto Recodo' },
          { id: '220507', nombre: 'Rumisapa' },
          { id: '220508', nombre: 'San Roque de Cumbaza' },
          { id: '220509', nombre: 'Shanao' },
          { id: '220510', nombre: 'Tabalosos' },
          { id: '220511', nombre: 'Zapatero' }
        ]
      },
      {
        id: '2206',
        nombre: 'Mariscal Cáceres',
        distritos: [
          { id: '220601', nombre: 'Juanjuí' },
          { id: '220602', nombre: 'Campanilla' },
          { id: '220603', nombre: 'Huicungo' },
          { id: '220604', nombre: 'Pachiza' },
          { id: '220605', nombre: 'Pajarillo' }
        ]
      },
      {
        id: '2207',
        nombre: 'Picota',
        distritos: [
          { id: '220701', nombre: 'Picota' },
          { id: '220702', nombre: 'Buenos Aires' },
          { id: '220703', nombre: 'Caspisapa' },
          { id: '220704', nombre: 'Pilluana' },
          { id: '220705', nombre: 'Pucacaca' },
          { id: '220706', nombre: 'San Cristóbal' },
          { id: '220707', nombre: 'San Hilarión' },
          { id: '220708', nombre: 'Shamboyacu' },
          { id: '220709', nombre: 'Tingo de Ponasa' },
          { id: '220710', nombre: 'Tres Unidos' }
        ]
      },
      {
        id: '2208',
        nombre: 'Rioja',
        distritos: [
          { id: '220801', nombre: 'Rioja' },
          { id: '220802', nombre: 'Awajun' },
          { id: '220803', nombre: 'Elias Soplin Vargas' },
          { id: '220804', nombre: 'Nueva Cajamarca' },
          { id: '220805', nombre: 'Pardo Miguel' },
          { id: '220806', nombre: 'Posic' },
          { id: '220807', nombre: 'San Fernando' },
          { id: '220808', nombre: 'Yorongos' },
          { id: '220809', nombre: 'Yuracyacu' }
        ]
      },
      {
        id: '2209',
        nombre: 'San Martín',
        distritos: [
          { id: '220901', nombre: 'Tarapoto' },
          { id: '220902', nombre: 'Alberto Leveau' },
          { id: '220903', nombre: 'Cacatachi' },
          { id: '220904', nombre: 'Chazuta' },
          { id: '220905', nombre: 'Chipurana' },
          { id: '220906', nombre: 'El Porvenir' },
          { id: '220907', nombre: 'Huimbayoc' },
          { id: '220908', nombre: 'Juan Guerra' },
          { id: '220909', nombre: 'La Banda de Shilcayo' },
          { id: '220910', nombre: 'Morales' },
          { id: '220911', nombre: 'Papaplaya' },
          { id: '220912', nombre: 'San Antonio' },
          { id: '220913', nombre: 'Sauce' },
          { id: '220914', nombre: 'Shapaja' }
        ]
      },
      {
        id: '2210',
        nombre: 'Tocache',
        distritos: [
          { id: '221001', nombre: 'Tocache' },
          { id: '221002', nombre: 'Nuevo Progreso' },
          { id: '221003', nombre: 'Pólvora' },
          { id: '221004', nombre: 'Shunte' },
          { id: '221005', nombre: 'Uchiza' }
        ]
      }
    ]
  },
  {
    id: '23',
    nombre: 'Tacna',
    provincias: [
      {
        id: '2301',
        nombre: 'Tacna',
        distritos: [
          { id: '230101', nombre: 'Tacna' },
          { id: '230102', nombre: 'Alto de la Alianza' },
          { id: '230103', nombre: 'Calana' },
          { id: '230104', nombre: 'Ciudad Nueva' },
          { id: '230105', nombre: 'Inclán' },
          { id: '230106', nombre: 'Pachía' },
          { id: '230107', nombre: 'Palca' },
          { id: '230108', nombre: 'Pocollay' },
          { id: '230109', nombre: 'Sama' },
          { id: '230110', nombre: 'Coronel Gregorio Albarracín Lanchipa' },
          { id: '230111', nombre: 'La Yarada los Palos' }
        ]
      },
      {
        id: '2302',
        nombre: 'Candarave',
        distritos: [
          { id: '230201', nombre: 'Candarave' },
          { id: '230202', nombre: 'Cairani' },
          { id: '230203', nombre: 'Camilaca' },
          { id: '230204', nombre: 'Curibaya' },
          { id: '230205', nombre: 'Huanuara' },
          { id: '230206', nombre: 'Quilahuani' }
        ]
      },
      {
        id: '2303',
        nombre: 'Jorge Basadre',
        distritos: [
          { id: '230301', nombre: 'Locumba' },
          { id: '230302', nombre: 'Ilabaya' },
          { id: '230303', nombre: 'Ite' }
        ]
      },
      {
        id: '2304',
        nombre: 'Tarata',
        distritos: [
          { id: '230401', nombre: 'Tarata' },
          { id: '230402', nombre: 'Chucatamani' },
          { id: '230403', nombre: 'Estique' },
          { id: '230404', nombre: 'Estique-Pampa' },
          { id: '230405', nombre: 'Sitajara' },
          { id: '230406', nombre: 'Susapaya' },
          { id: '230407', nombre: 'Tarucachi' },
          { id: '230408', nombre: 'Ticaco' }
        ]
      }
    ]
  },
  {
    id: '24',
    nombre: 'Tumbes',
    provincias: [
      {
        id: '2401',
        nombre: 'Tumbes',
        distritos: [
          { id: '240101', nombre: 'Tumbes' },
          { id: '240102', nombre: 'Corrales' },
          { id: '240103', nombre: 'La Cruz' },
          { id: '240104', nombre: 'Pampas de Hospital' },
          { id: '240105', nombre: 'San Jacinto' },
          { id: '240106', nombre: 'San Juan de la Virgen' }
        ]
      },
      {
        id: '2402',
        nombre: 'Contralmirante Villar',
        distritos: [
          { id: '240201', nombre: 'Zorritos' },
          { id: '240202', nombre: 'Casitas' },
          { id: '240203', nombre: 'Canoas de Punta Sal' }
        ]
      },
      {
        id: '2403',
        nombre: 'Zarumilla',
        distritos: [
          { id: '240301', nombre: 'Zarumilla' },
          { id: '240302', nombre: 'Aguas Verdes' },
          { id: '240303', nombre: 'Matapalo' },
          { id: '240304', nombre: 'Papayal' }
        ]
      }
    ]
  },
  {
    id: '25',
    nombre: 'Ucayali',
    provincias: [
      {
        id: '2501',
        nombre: 'Coronel Portillo',
        distritos: [
          { id: '250101', nombre: 'Callería' },
          { id: '250102', nombre: 'Campoverde' },
          { id: '250103', nombre: 'Iparía' },
          { id: '250104', nombre: 'Masisea' },
          { id: '250105', nombre: 'Yarinacocha' },
          { id: '250106', nombre: 'Nueva Requena' },
          { id: '250107', nombre: 'Manantay' }
        ]
      },
      {
        id: '2502',
        nombre: 'Atalaya',
        distritos: [
          { id: '250201', nombre: 'Raymondi' },
          { id: '250202', nombre: 'Sepahua' },
          { id: '250203', nombre: 'Tahuanía' },
          { id: '250204', nombre: 'Yurúa' }
        ]
      },
      {
        id: '2503',
        nombre: 'Padre Abad',
        distritos: [
          { id: '250301', nombre: 'Padre Abad' },
          { id: '250302', nombre: 'Irazola' },
          { id: '250303', nombre: 'Curimaná' },
          { id: '250304', nombre: 'Neshuya' },
          { id: '250305', nombre: 'Alexander Von Humboldt' }
        ]
      },
      {
        id: '2504',
        nombre: 'Purús',
        distritos: [
          { id: '250401', nombre: 'Purús' }
        ]
      }
    ]
  }
];

// Funciones auxiliares
export const getDepartamentos = (): SelectOption[] => {
  return ubigeoPeru.map(depto => ({
    id: depto.id,
    label: depto.nombre
  }));
};

export const getProvinciasByDepartamento = (departamentoId: string): SelectOption[] => {
  const departamento = ubigeoPeru.find(d => d.id === departamentoId);
  if (!departamento || !departamento.provincias) return [];
  
  return departamento.provincias.map(prov => ({
    id: prov.id,
    label: prov.nombre
  }));
};

export const getDistritosByProvincia = (departamentoId: string, provinciaId: string): SelectOption[] => {
  const departamento = ubigeoPeru.find(d => d.id === departamentoId);
  if (!departamento || !departamento.provincias) return [];
  
  const provincia = departamento.provincias.find(p => p.id === provinciaId);
  if (!provincia || !provincia.distritos) return [];
  
  return provincia.distritos.map(dist => ({
    id: dist.id,
    label: dist.nombre
  }));
};