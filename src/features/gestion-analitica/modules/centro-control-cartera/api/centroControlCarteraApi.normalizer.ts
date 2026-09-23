type Registro = Record<string, unknown>;

const esRegistro = (valor: unknown): valor is Registro =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor);

const registro = (valor: unknown): Registro =>
  esRegistro(valor) ? valor : {};

const lista = (valor: unknown): unknown[] =>
  Array.isArray(valor) ? valor : [];

const valor = (
  origen: Registro,
  claveEspanol: string,
  claveNormalizada: string = claveEspanol
): unknown =>
  Object.prototype.hasOwnProperty.call(origen, claveEspanol)
    ? origen[claveEspanol]
    : origen[claveNormalizada];

const normalizarCampana = (entrada: unknown) => {
  const item = registro(entrada);
  return {
    code: item.code,
    name: valor(item, 'nombre', 'name'),
  };
};

const normalizarResumen = (entrada: unknown) => {
  const response = registro(entrada);
  const periodo = registro(valor(response, 'periodo', 'period'));
  const vigencia = registro(valor(response, 'vigencia', 'freshness'));
  const resumen = registro(valor(response, 'resumen', 'summary'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    period: {
      dateFrom: valor(periodo, 'fechaDesde', 'dateFrom'),
      dateTo: valor(periodo, 'fechaHasta', 'dateTo'),
      snapshotDate: valor(periodo, 'fechaCorte', 'snapshotDate'),
    },
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    freshness: {
      operationAsOfAt: vigencia.operationAsOfAt,
      portfolioBaseRefreshedAt: vigencia.portfolioBaseRefreshedAt,
      refreshedAt: vigencia.refreshedAt,
    },
    summary: {
      assignedPortfolio: valor(resumen, 'carteraAsignada', 'assignedPortfolio'),
      managedPortfolio: valor(resumen, 'carteraGestionada', 'managedPortfolio'),
      pendingPortfolio: valor(resumen, 'carteraPendiente', 'pendingPortfolio'),
      managementCount: valor(resumen, 'cantidadGestiones', 'managementCount'),
      managementIntensity: valor(resumen, 'intensidadGestion', 'managementIntensity'),
      recoveredAmount: valor(resumen, 'montoRecuperado', 'recoveredAmount'),
      contactabilityRate: valor(resumen, 'tasaContactabilidad', 'contactabilityRate'),
      rpcRate: valor(resumen, 'tasaContactoDirecto', 'rpcRate'),
      closeRate: valor(resumen, 'tasaCierre', 'closeRate'),
      promiseCount: valor(resumen, 'cantidadPromesas', 'promiseCount'),
      promiseFulfillmentRate: valor(
        resumen,
        'tasaCumplimientoPromesa',
        'promiseFulfillmentRate'
      ),
      paymentCount: valor(resumen, 'cantidadPagos', 'paymentCount'),
    },
  };
};

const normalizarAvanceMeta = (entrada: unknown) => {
  const response = registro(entrada);
  const periodo = registro(valor(response, 'periodo', 'period'));
  const metaEntrada = valor(response, 'meta', 'target');
  const meta = metaEntrada === null ? null : registro(metaEntrada);

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    period: {
      dateTo: valor(periodo, 'fechaHasta', 'dateTo'),
      asOfDate: valor(periodo, 'fechaCorte', 'asOfDate'),
    },
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    target:
      meta === null
        ? null
        : {
            monthlyTargetAmount: valor(meta, 'montoMetaMensual', 'monthlyTargetAmount'),
            expectedToDateAmount: valor(meta, 'montoEsperadoFecha', 'expectedToDateAmount'),
            targetAchievementRate: valor(meta, 'tasaCumplimientoMeta', 'targetAchievementRate'),
            paceAchievementRate: valor(meta, 'tasaCumplimientoRitmo', 'paceAchievementRate'),
            gapAmount: valor(meta, 'montoBrecha', 'gapAmount'),
            gapRate: valor(meta, 'tasaBrecha', 'gapRate'),
          },
  };
};

const normalizarPromesas = (entrada: unknown) => {
  const response = registro(entrada);
  const promises = registro(response.promises);

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    promises: {
      dueTodayCount: valor(promises, 'cantidadVenceHoy', 'dueTodayCount'),
      dueTodayAmount: valor(promises, 'montoVenceHoy', 'dueTodayAmount'),
      overdueCount: valor(promises, 'cantidadVencidas', 'overdueCount'),
      fulfillmentRate: valor(promises, 'tasaCumplimiento', 'fulfillmentRate'),
    },
  };
};

const normalizarEvolucion = (entrada: unknown) => {
  const response = registro(entrada);
  const periodo = registro(valor(response, 'periodo', 'period'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    period: {
      dateFrom: valor(periodo, 'fechaDesde', 'dateFrom'),
      dateTo: valor(periodo, 'fechaHasta', 'dateTo'),
    },
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    evolution: lista(valor(response, 'evolucion', 'evolution')).map((raw) => {
      const item = registro(raw);
      return {
        period: valor(item, 'periodo', 'period'),
        assignedPortfolio: valor(item, 'carteraAsignada', 'assignedPortfolio'),
        managedPortfolio: valor(item, 'carteraGestionada', 'managedPortfolio'),
        pendingPortfolio: valor(item, 'carteraPendiente', 'pendingPortfolio'),
        recoveredAmount: valor(item, 'montoRecuperado', 'recoveredAmount'),
      };
    }),
  };
};

const normalizarSerieEvolucionComparativa = (entrada: unknown) => {
  if (entrada === null) {
    return null;
  }

  const response = registro(entrada);
  const periodo = registro(valor(response, 'periodo', 'period'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    period: {
      dateFrom: valor(periodo, 'fechaDesde', 'dateFrom'),
      dateTo: valor(periodo, 'fechaHasta', 'dateTo'),
    },
    coversComparablePeriod: valor(
      response,
      'cubrePeriodoComparable',
      'coversComparablePeriod'
    ),
    evolution: lista(valor(response, 'evolucion', 'evolution')).map((raw) => {
      const item = registro(raw);
      return {
        period: valor(item, 'periodo', 'period'),
        assignedPortfolio: valor(item, 'carteraAsignada', 'assignedPortfolio'),
        managedPortfolio: valor(item, 'carteraGestionada', 'managedPortfolio'),
        pendingPortfolio: valor(item, 'carteraPendiente', 'pendingPortfolio'),
        recoveredAmount: valor(item, 'montoRecuperado', 'recoveredAmount'),
      };
    }),
  };
};

export const normalizarEvolucionComparativaCarteraTransporte = (
  entrada: unknown
) => {
  const response = registro(entrada);
  const periodo = registro(
    valor(response, 'periodoReferencia', 'referencePeriod')
  );

  return {
    referencePeriod: {
      dateFrom: valor(periodo, 'fechaDesde', 'dateFrom'),
      dateTo: valor(periodo, 'fechaHasta', 'dateTo'),
    },
    comparableProgressMonths: valor(
      response,
      'mesesComparablesAvance',
      'comparableProgressMonths'
    ),
    comparableRecoveryMonths: valor(
      response,
      'mesesComparablesRecuperacion',
      'comparableRecoveryMonths'
    ),
    previousMonth: normalizarSerieEvolucionComparativa(
      valor(response, 'mesAnterior', 'previousMonth')
    ),
    bestProgress: normalizarSerieEvolucionComparativa(
      valor(response, 'mejorAvance', 'bestProgress')
    ),
    bestRecovery: normalizarSerieEvolucionComparativa(
      valor(response, 'mejorRecuperacion', 'bestRecovery')
    ),
  };
};

export const normalizarPanoramaCarteraTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  return {
    summary: normalizarResumen(valor(response, 'resumen', 'summary')),
    targetProgress: normalizarAvanceMeta(response.targetProgress),
    promises: normalizarPromesas(response.promises),
    evolution: normalizarEvolucion(valor(response, 'evolucion', 'evolution')),
  };
};

const normalizarOpcionesFiltro = (entrada: unknown) => {
  const response = registro(entrada);
  const cartera = registro(valor(response, 'cartera', 'portfolio'));
  const disponibilidad = registro(response.availability);

  return {
    availableDateFrom: valor(response, 'fechaDisponibleDesde', 'availableDateFrom'),
    availableDateTo: valor(response, 'fechaDisponibleHasta', 'availableDateTo'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    portfolio: { id: cartera.id },
    businessUnits: lista(valor(response, 'unidadesNegocio', 'businessUnits')).map((raw) => {
      const item = registro(raw);
      return { code: item.code, name: valor(item, 'nombre', 'name') };
    }),
    selectedBusinessUnit: response.selectedBusinessUnit,
    campaigns: lista(valor(response, 'campanas', 'campaigns')).map((raw) => {
      const item = registro(raw);
      return {
        code: item.code,
        name: valor(item, 'nombre', 'name'),
        year: item.year,
        month: item.month,
        startDate: valor(item, 'fechaInicio', 'startDate'),
        endDate: valor(item, 'fechaFin', 'endDate'),
        availableDateFrom: valor(item, 'fechaDisponibleDesde', 'availableDateFrom'),
        availableDateTo: valor(item, 'fechaDisponibleHasta', 'availableDateTo'),
      };
    }),
    subPortfolios: lista(response.subPortfolios).map((raw) => {
      const item = registro(raw);
      return { id: item.id, name: valor(item, 'nombre', 'name') };
    }),
    supervisors: lista(valor(response, 'supervisores', 'supervisors')).map((raw) => {
      const item = registro(raw);
      return { id: item.id, name: valor(item, 'nombre', 'name') };
    }),
    availability: {
      subPortfolioCampaigns: lista(disponibilidad.subPortfolioCampaigns).map((raw) => {
        const item = registro(raw);
        return {
          subPortfolioId: valor(item, 'idSubCartera', 'subPortfolioId'),
          campaignCode: valor(item, 'codigoCampana', 'campaignCode'),
          availableDateFrom: valor(item, 'fechaDisponibleDesde', 'availableDateFrom'),
          availableDateTo: valor(item, 'fechaDisponibleHasta', 'availableDateTo'),
        };
      }),
      supervisorContexts: lista(disponibilidad.supervisorContexts).map((raw) => {
        const item = registro(raw);
        return {
          supervisorId: valor(item, 'idSupervisor', 'supervisorId'),
          subPortfolioId: valor(item, 'idSubCartera', 'subPortfolioId'),
          campaignCode: valor(item, 'codigoCampana', 'campaignCode'),
          availableDateFrom: valor(item, 'fechaDisponibleDesde', 'availableDateFrom'),
          availableDateTo: valor(item, 'fechaDisponibleHasta', 'availableDateTo'),
        };
      }),
    },
  };
};

export const normalizarInicializacionCarteraTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  const panorama = valor(response, 'panorama', 'overview');
  return {
    filterOptions: normalizarOpcionesFiltro(response.filterOptions),
    overview: panorama === null ? null : normalizarPanoramaCarteraTransporte(panorama),
  };
};

export const normalizarRendimientoSupervisorTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  return {
    dateFrom: valor(response, 'fechaDesde', 'dateFrom'),
    dateTo: valor(response, 'fechaHasta', 'dateTo'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    supervisors: lista(valor(response, 'supervisores', 'supervisors')).map((raw) => {
      const item = registro(raw);
      const managedDebtorCount = valor(
        item,
        'cantidadDeudoresGestionados',
        'managedDebtorCount'
      );

      return {
        supervisorId: valor(item, 'idSupervisor', 'supervisorId'),
        supervisorName: valor(item, 'nombreSupervisor', 'supervisorName'),
        advisorCount: valor(item, 'cantidadAsesores', 'advisorCount'),
        managementCount: valor(item, 'cantidadGestiones', 'managementCount'),
        managedDebtorCount:
          managedDebtorCount === undefined ? null : managedDebtorCount,
        rpcRate: valor(item, 'tasaContactoDirecto', 'rpcRate'),
        closeRate: valor(item, 'tasaCierre', 'closeRate'),
        promiseCount: valor(item, 'cantidadPromesas', 'promiseCount'),
        promiseFulfillmentRate: valor(item, 'tasaCumplimientoPromesa', 'promiseFulfillmentRate'),
        paymentCount: valor(item, 'cantidadPagos', 'paymentCount'),
        attributableRecoveredAmount: valor(item, 'montoRecuperadoAtribuible', 'attributableRecoveredAmount'),
      };
    }),
  };
};

export const normalizarRendimientoAsesorTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  return {
    dateFrom: valor(response, 'fechaDesde', 'dateFrom'),
    dateTo: valor(response, 'fechaHasta', 'dateTo'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    advisors: lista(valor(response, 'asesores', 'advisors')).map((raw) => {
      const item = registro(raw);
      const managedDebtorCount = valor(
        item,
        'cantidadDeudoresGestionados',
        'managedDebtorCount'
      );

      return {
        advisorId: valor(item, 'idAsesor', 'advisorId'),
        advisorName: valor(item, 'nombreAsesor', 'advisorName'),
        periodSupervisorId: valor(item, 'idSupervisorPeriodo', 'periodSupervisorId'),
        periodSupervisorName: valor(item, 'nombreSupervisorPeriodo', 'periodSupervisorName'),
        currentSupervisorId: valor(item, 'idSupervisorActual', 'currentSupervisorId'),
        currentSupervisorName: valor(item, 'nombreSupervisorActual', 'currentSupervisorName'),
        managementCount: valor(item, 'cantidadGestiones', 'managementCount'),
        managedDebtorCount:
          managedDebtorCount === undefined ? null : managedDebtorCount,
        rpcRate: valor(item, 'tasaContactoDirecto', 'rpcRate'),
        closeRate: valor(item, 'tasaCierre', 'closeRate'),
        promiseCount: valor(item, 'cantidadPromesas', 'promiseCount'),
        paymentCount: valor(item, 'cantidadPagos', 'paymentCount'),
        attributableRecoveredAmount: valor(item, 'montoRecuperadoAtribuible', 'attributableRecoveredAmount'),
      };
    }),
  };
};

const normalizarPaginacion = (entrada: unknown) => {
  const item = registro(entrada);
  return {
    page: valor(item, 'pagina', 'page'),
    pageSize: valor(item, 'tamanoPagina', 'pageSize'),
    totalItems: item.totalItems,
    totalPages: item.totalPages,
    hasPreviousPage: valor(item, 'tienePaginaAnterior', 'hasPreviousPage'),
    hasNextPage: valor(item, 'tienePaginaSiguiente', 'hasNextPage'),
  };
};

const antiguedadBackendAInterna = (clave: unknown): unknown =>
  clave === '8-mas' ? '8-plus' : clave === 'sin-clasificar' ? 'unclassified' : clave;


const situacionVencidaBackendAInterna = (
  clave: unknown,
  montoPagado: unknown
): 'no-payment-recorded' | 'partial-payment' => {
  if (clave === 'sin-pago-registrado' || clave === 'no-payment-recorded') {
    return 'no-payment-recorded';
  }

  if (clave === 'pago-parcial' || clave === 'partial-payment') {
    return 'partial-payment';
  }

  return typeof montoPagado === 'number' && montoPagado > 0
    ? 'partial-payment'
    : 'no-payment-recorded';
};

const etiquetaSituacionVencida = (
  etiqueta: unknown,
  clave: 'no-payment-recorded' | 'partial-payment'
): string =>
  typeof etiqueta === 'string' && etiqueta.trim()
    ? etiqueta.trim()
    : clave === 'partial-payment'
      ? 'Pago parcial'
      : 'Sin pago registrado';

const estadoBackendAInterno = (clave: unknown): unknown =>
  clave === 'pendiente' ? 'pending' : clave === 'parcial' ? 'partial' : clave === 'cubierta' ? 'covered' : clave;

export const normalizarPromesasVencidasTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  const resumen = registro(valor(response, 'resumen', 'summary'));
  const filtros = registro(valor(response, 'filtros', 'filters'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    asOfDate: valor(response, 'fechaCorte', 'asOfDate'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    summary: {
      overdueCount: valor(resumen, 'cantidadVencidas', 'overdueCount'),
      overdueAmount: valor(resumen, 'montoVencido', 'overdueAmount'),
      outstandingAmount: valor(resumen, 'montoPendiente', 'outstandingAmount'),
    },
    aging: lista(valor(response, 'antiguedad', 'aging')).map((raw) => {
      const item = registro(raw);
      return {
        key: antiguedadBackendAInterna(valor(item, 'clave', 'key')),
        label: valor(item, 'etiqueta', 'label'),
        count: valor(item, 'cantidad', 'count'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
      };
    }),
    filters: {
      advisors: lista(valor(filtros, 'asesores', 'advisors')).map((raw) => {
        const item = registro(raw);
        return { id: item.id, name: valor(item, 'nombre', 'name') };
      }),
      supervisors: lista(valor(filtros, 'supervisores', 'supervisors')).map((raw) => {
        const item = registro(raw);
        return { id: item.id, name: valor(item, 'nombre', 'name') };
      }),
    },
    pagination: normalizarPaginacion(valor(response, 'paginacion', 'pagination')),
    items: lista(valor(response, 'elementos', 'items')).map((raw) => {
      const item = registro(raw);
      const paidAmount = valor(item, 'montoPagado', 'paidAmount');
      const situationKey = situacionVencidaBackendAInterna(
        valor(item, 'claveSituacion', 'situationKey'),
        paidAmount
      );

      return {
        promiseId: valor(item, 'idPromesa', 'promiseId'),
        debtorId: valor(item, 'idDeudor', 'debtorId'),
        debtorName: valor(item, 'nombreDeudor', 'debtorName') ?? null,
        dueDate: valor(item, 'fechaVencimiento', 'dueDate'),
        overdueDays: valor(item, 'diasVencimiento', 'overdueDays'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        paidAmount,
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
        situationKey,
        situationLabel: etiquetaSituacionVencida(
          valor(item, 'etiquetaSituacion', 'situationLabel'),
          situationKey
        ),
        agingKey: antiguedadBackendAInterna(valor(item, 'claveAntiguedad', 'agingKey')),
        advisorId: valor(item, 'idAsesor', 'advisorId'),
        advisorName: valor(item, 'nombreAsesor', 'advisorName'),
        supervisorId: valor(item, 'idSupervisor', 'supervisorId'),
        supervisorName: valor(item, 'nombreSupervisor', 'supervisorName'),
      };
    }),
  };
};

export const normalizarPromesasVenceHoyTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  const resumen = registro(valor(response, 'resumen', 'summary'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    asOfDate: valor(response, 'fechaCorte', 'asOfDate'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    summary: {
      dueTodayCount: valor(resumen, 'cantidadVenceHoy', 'dueTodayCount'),
      dueTodayAmount: valor(resumen, 'montoVenceHoy', 'dueTodayAmount'),
      paidAmount: valor(resumen, 'montoPagado', 'paidAmount'),
      outstandingAmount: valor(resumen, 'montoPendiente', 'outstandingAmount'),
    },
    status: lista(valor(response, 'estado', 'status')).map((raw) => {
      const item = registro(raw);
      return {
        key: estadoBackendAInterno(valor(item, 'clave', 'key')),
        label: valor(item, 'etiqueta', 'label'),
        count: valor(item, 'cantidad', 'count'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        paidAmount: valor(item, 'montoPagado', 'paidAmount'),
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
      };
    }),
    pagination: normalizarPaginacion(valor(response, 'paginacion', 'pagination')),
    items: lista(valor(response, 'elementos', 'items')).map((raw) => {
      const item = registro(raw);
      return {
        promiseId: valor(item, 'idPromesa', 'promiseId'),
        debtorId: valor(item, 'idDeudor', 'debtorId'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        paidAmount: valor(item, 'montoPagado', 'paidAmount'),
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
        lastPaymentDate: valor(item, 'fechaUltimoPago', 'lastPaymentDate'),
        statusKey: estadoBackendAInterno(valor(item, 'claveEstado', 'statusKey')),
        advisorId: valor(item, 'idAsesor', 'advisorId'),
        advisorName: valor(item, 'nombreAsesor', 'advisorName'),
        supervisorId: valor(item, 'idSupervisor', 'supervisorId'),
        supervisorName: valor(item, 'nombreSupervisor', 'supervisorName'),
      };
    }),
  };
};

const seguimientoEstadoBackendAInterno = (clave: unknown): unknown => {
  switch (clave) {
    case 'pendiente':
      return 'pending';
    case 'parcial':
      return 'partial';
    case 'cumplida':
      return 'fulfilled';
    case 'incumplida':
      return 'broken';
    case 'pagada-fuera-plazo':
      return 'paid-out-of-range';
    default:
      return clave;
  }
};

const seguimientoContactoBackendAInterno = (clave: unknown): unknown => {
  switch (clave) {
    case 'directo':
      return 'direct';
    case 'indirecto':
      return 'indirect';
    case 'sin-contacto':
      return 'no-contact';
    case 'sin-gestion':
      return 'no-management';
    default:
      return clave;
  }
};

export const normalizarSeguimientoPromesasTransporte = (entrada: unknown) => {
  const response = registro(entrada);
  const resumen = registro(valor(response, 'resumen', 'summary'));

  return {
    campaign: normalizarCampana(valor(response, 'campana', 'campaign')),
    dueDate: valor(response, 'fechaVencimiento', 'dueDate'),
    asOfDate: valor(response, 'fechaCorte', 'asOfDate'),
    updatedAt: valor(response, 'fechaActualizacion', 'updatedAt'),
    summary: {
      promiseCount: valor(resumen, 'cantidadPromesas', 'promiseCount'),
      promiseAmount: valor(resumen, 'montoPromesa', 'promiseAmount'),
      paidAmount: valor(resumen, 'montoPagado', 'paidAmount'),
      outstandingAmount: valor(resumen, 'montoPendiente', 'outstandingAmount'),
    },
    status: lista(valor(response, 'estado', 'status')).map((raw) => {
      const item = registro(raw);
      return {
        key: seguimientoEstadoBackendAInterno(valor(item, 'clave', 'key')),
        label: valor(item, 'etiqueta', 'label'),
        count: valor(item, 'cantidad', 'count'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        paidAmount: valor(item, 'montoPagado', 'paidAmount'),
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
      };
    }),
    pagination: normalizarPaginacion(valor(response, 'paginacion', 'pagination')),
    items: lista(valor(response, 'elementos', 'items')).map((raw) => {
      const item = registro(raw);
      return {
        promiseId: valor(item, 'idPromesa', 'promiseId'),
        debtorId: valor(item, 'idDeudor', 'debtorId'),
        debtorName: valor(item, 'nombreDeudor', 'debtorName'),
        dueDate: valor(item, 'fechaVencimiento', 'dueDate'),
        promiseAmount: valor(item, 'montoPromesa', 'promiseAmount'),
        paidAmount: valor(item, 'montoPagado', 'paidAmount'),
        outstandingAmount: valor(item, 'montoPendiente', 'outstandingAmount'),
        lastPaymentDate: valor(item, 'fechaUltimoPago', 'lastPaymentDate'),
        statusKey: seguimientoEstadoBackendAInterno(
          valor(item, 'claveEstado', 'statusKey')
        ),
        managed: valor(item, 'gestionado', 'managed'),
        managementCount: valor(item, 'cantidadGestiones', 'managementCount'),
        callCount: valor(item, 'cantidadLlamadas', 'callCount'),
        contactKey: seguimientoContactoBackendAInterno(
          valor(item, 'claveContacto', 'contactKey')
        ),
        contactLabel: valor(item, 'etiquetaContacto', 'contactLabel'),
        paymentConfirmed: valor(item, 'confirmoPago', 'paymentConfirmed'),
        lastManagementAt: valor(item, 'fechaUltimaGestion', 'lastManagementAt'),
        advisorId: valor(item, 'idAsesor', 'advisorId'),
        advisorName: valor(item, 'nombreAsesor', 'advisorName'),
        supervisorId: valor(item, 'idSupervisor', 'supervisorId'),
        supervisorName: valor(item, 'nombreSupervisor', 'supervisorName'),
      };
    }),
  };
};
