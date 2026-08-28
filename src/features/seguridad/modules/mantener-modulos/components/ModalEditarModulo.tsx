import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  hasRegisteredOptionRoute,
} from '@features/access-control/registry/optionRoute.registry';

import {
  getAnalyticsOptionGroups,
  getAnalyticsOptionReportClientEmbeds,
  type AnalyticsOptionReportClientPublication,
  type AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import {
  fetchGruposListado,
} from '@features/seguridad/api/gruposApi';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import {
  fetchOpcionById,
} from '../../../api/opcionesApi';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import {
  MODAL_EDITAR_MODULO_TEXTS,
} from '../constants/modalEditarModulo.constants';

import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';

import {
  buildEditableParentOptions,
  buildOrderOptions,
  buildOrderPreview,
  mapOpcionApiToEditarModuloForm,
  resolveModuloCodeAfterNameChange,
  resolveOrderAfterParentChange,
} from '../utils/editarModulo.utils';


import {
  useModuloAvailabilityControls,
} from '../hooks/useModuloAvailabilityControls';

import {
  normalizeModuloForm,
  validateEditarModuloForm,
} from '../validations/registrarModulo.validation';

import ModuloFormErrorSummary from './ModuloFormErrorSummary';

import ModuloFormFields from './ModuloFormFields';

import ModuloOrderControl from './ModuloOrderControl';

import PowerBiGroupSelector from './PowerBiGroupSelector';

import PowerBiReportClientPublications from './PowerBiReportClientPublications';

import './PowerBiGroupSelector.css';

import {
  getMantenerModulosPermissionMessage,
} from '../utils/mantenerModulosPermissions';

import {
  isValidPowerBiPublishToWebUrl,
} from '../utils/powerBiModulo.utils';

interface ModalEditarModuloProps {
  isOpen: boolean;
  canEdit: boolean;
  moduloId: number;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onGuardar: (
    modulo: OpcionApi,
    data: EditarModuloFormData,
    groupIds: readonly number[],
    reportClientPublications:
      readonly AnalyticsReportClientPublicationInput[] | null
  ) => Promise<void> | void;
}

const EMPTY_EDIT_FORM:
  EditarModuloFormData = {
    nombre: '',
    descripcion: '',
    codigo: '',
    icono: '',
    esPowerBI: false,
    urlBI: '',
    imagenOpcion: '',
    emailOpcion: '',
    padreId: 0,
    orden: 0,
    visible: true,
    estado: true,
  };

const serializeReportClientPublications = (
  publications: readonly AnalyticsOptionReportClientPublication[]
): string =>
  publications
    .map((publication) => ({
      clientId: publication.clientId,
      name: publication.name.trim(),
      groupIds: publication.groupIds
        .slice()
        .sort((a, b) => a - b),
      embedUrl:
        publication.embedUrl?.trim() ?? '',
    }))
    .sort(
      (left, right) =>
        left.name.localeCompare(
          right.name,
          'es-PE',
          { sensitivity: 'base' }
        ) ||
        left.clientId - right.clientId
    )
    .map(
      (publication) =>
        `${publication.clientId}:${publication.name}:${publication.groupIds.join(',')}:${publication.embedUrl}`
    )
    .join('\n');

const getChangedReportClientPublications = (
  current: readonly AnalyticsOptionReportClientPublication[],
  configured: readonly AnalyticsOptionReportClientPublication[]
): AnalyticsReportClientPublicationInput[] => {
  const configuredByKey = new Map(
    configured.map((publication) => [
      `${publication.clientId}:${publication.name.toLocaleLowerCase('es-PE')}`,
      publication,
    ])
  );

  return current
    .filter((publication) => publication.isAvailable)
    .filter((publication) => {
      const configuredPublication =
        configuredByKey.get(
          `${publication.clientId}:${publication.name.toLocaleLowerCase('es-PE')}`
        );

      if (!configuredPublication) {
        return true;
      }

      return (
        publication.embedUrl?.trim() !==
          configuredPublication.embedUrl?.trim() ||
        publication.groupIds
          .slice()
          .sort((a, b) => a - b)
          .join(',') !==
          configuredPublication.groupIds
            .slice()
            .sort((a, b) => a - b)
            .join(',')
      );
    })
    .map((publication) => ({
      clientId: publication.clientId,
      name: publication.name.trim(),
      groupIds: publication.groupIds,
      embedUrl:
        publication.embedUrl?.trim() ?? '',
    }));
};

export const ModalEditarModulo = ({
  isOpen,
  canEdit,
  moduloId,
  modulosExistentes,
  onClose,
  onGuardar,
}: ModalEditarModuloProps): ReactNode => {
  const [
    editedGroupIds,
    setEditedGroupIds,
  ] = useState<number[] | null>(
    null
  );

  const [
    editedReportClientPublications,
    setEditedReportClientPublications,
  ] = useState<
    AnalyticsOptionReportClientPublication[] | null
  >(null);

  const [
    groupSelectionError,
    setGroupSelectionError,
  ] = useState<string | null>(
    null
  );

  const isImplementedModule =
    hasRegisteredOptionRoute(
      moduloId
    );

  const fetcher =
    useCallback(
      (
        signal: AbortSignal
      ) =>
        fetchOpcionById(
          moduloId,
          signal
        ),
      [moduloId]
    );

  const {
    data: moduloDetalle,
    isLoading,
    error,
    refetch,
  } =
    useApiResource<OpcionApi>(
      fetcher,
      [moduloId]
    );

  const isPowerBiModule =
    Boolean(
      moduloDetalle?.sUrlBI?.trim()
    );

  const analyticsGroupsFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) =>
        getAnalyticsOptionGroups(
          moduloId,
          signal
        ),
      [moduloId]
    );

  const {
    data: activeGroups,
    isLoading:
      isLoadingActiveGroups,
    error: activeGroupsError,
    refetch:
      refetchActiveGroups,
  } = useApiResource(
    fetchGruposListado,
    [moduloId],
    {
      enabled:
        isOpen &&
        isPowerBiModule,
      initialLoading: false,
    }
  );

  const powerBiGroups =
    useMemo(
      () =>
        (activeGroups ?? []).filter(
          (group) =>
            group.estado === 'Activo' &&
            group.idCliente > 0
        ),
      [activeGroups]
    );

  const {
    data: analyticsOptionGroups,
    isLoading:
      isLoadingAnalyticsGroups,
    error: analyticsGroupsError,
    refetch:
      refetchAnalyticsGroups,
  } = useApiResource(
    analyticsGroupsFetcher,
    [moduloId],
    {
      enabled:
        isOpen &&
        isPowerBiModule,
      initialLoading: false,
    }
  );

  const analyticsReportClientEmbedsFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) =>
        getAnalyticsOptionReportClientEmbeds(
          moduloId,
          signal
        ),
      [moduloId]
    );

  const {
    data: analyticsReportClientEmbeds,
    isLoading:
      isLoadingReportClientEmbeds,
    error:
      reportClientEmbedsError,
    refetch:
      refetchReportClientEmbeds,
  } = useApiResource(
    analyticsReportClientEmbedsFetcher,
    [moduloId],
    {
      enabled:
        isOpen &&
        isPowerBiModule,
      initialLoading: false,
    }
  );

  const configuredReportClientPublications =
    useMemo(
      () =>
        analyticsReportClientEmbeds
          ?.clients ?? [],
      [analyticsReportClientEmbeds]
    );

  const reportClientPublications =
    editedReportClientPublications ??
    configuredReportClientPublications;

  const hasReportClientConfiguration =
    configuredReportClientPublications.length > 0;

  const hasInvalidReportClientPublication =
    reportClientPublications.some(
      (publication) => {
        if (!publication.isAvailable) {
          return false;
        }

        const embedUrl =
          publication.embedUrl?.trim() ?? '';

        return (
          (
            embedUrl.length > 0 &&
            !isValidPowerBiPublishToWebUrl(
              embedUrl
            )
          ) ||
          (
            embedUrl.length > 0 &&
            publication.groupIds.length === 0
          )
        );
      }
    );

  const configuredGroupIds =
    useMemo(
      () =>
        [
          ...new Set(
            analyticsOptionGroups
              ?.groupIds ??
              []
          ),
        ].sort(
          (a, b) => a - b
        ),
      [analyticsOptionGroups]
    );

  const selectedGroupIds =
    editedGroupIds ??
    configuredGroupIds;

  const hasValidGroupSelection =
    selectedGroupIds.length === 1 &&
    Number.isSafeInteger(
      selectedGroupIds[0]
    ) &&
    selectedGroupIds[0] > 0;

  const mapEntityToForm =
    useCallback(
      (
        modulo: OpcionApi
      ) =>
        mapOpcionApiToEditarModuloForm(
          modulo,
          modulosExistentes
        ),
      [modulosExistentes]
    );

  const validate =
    useCallback(
      (
        form: EditarModuloFormData
      ) =>
        validateEditarModuloForm(
          form,
          {
            modulosExistentes,
            moduloIdActual: moduloId,
            isImplemented:
              isImplementedModule,
          }
        ),
      [
        isImplementedModule,
        moduloId,
        modulosExistentes,
      ]
    );

  const {
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    setErrors,
    handleSubmit,
    handleCancel,
  } =
    useModalForm<
      EditarModuloFormData,
      OpcionApi
    >({
      initialForm:
        EMPTY_EDIT_FORM,

      entity:
        moduloDetalle,

      mapEntityToForm,

      onClose,

      validate,

      resetOnClose: true,

      onSubmit: async (
        data
      ) => {
        if (!moduloDetalle) {
          throw new Error(
            'No se encontró la información del módulo a actualizar.'
          );
        }

        if (
          data.esPowerBI &&
          !hasValidGroupSelection
        ) {
          const message =
            'Seleccione un grupo para el tablero Power BI.';

          setGroupSelectionError(
            message
          );

          throw new Error(
            message
          );
        }

        setGroupSelectionError(
          null
        );

        const changedReportClientPublications =
          data.esPowerBI &&
          hasReportClientConfiguration
            ? getChangedReportClientPublications(
                reportClientPublications,
                configuredReportClientPublications
              )
            : [];

        const reportClientPublicationsForSave:
          AnalyticsReportClientPublicationInput[] | null =
          changedReportClientPublications.length > 0
            ? changedReportClientPublications
            : null;

        await onGuardar(
          moduloDetalle,
          normalizeModuloForm(
            data
          ),
          data.esPowerBI
            ? selectedGroupIds
            : [],
          reportClientPublicationsForSave
        );
      },
    });

  const groupsDirty =
    form.esPowerBI &&
    editedGroupIds !== null &&
    editedGroupIds
      .slice()
      .sort((a, b) => a - b)
      .join(',') !==
      configuredGroupIds.join(',');

  const reportClientPublicationsDirty =
    form.esPowerBI &&
    editedReportClientPublications !== null &&
    serializeReportClientPublications(
      editedReportClientPublications
    ) !==
      serializeReportClientPublications(
        configuredReportClientPublications
      );

  const analyticsReportClientEmbedsBusy =
    form.esPowerBI &&
    isLoadingReportClientEmbeds;

  const analyticsReportClientEmbedsUnavailable =
    form.esPowerBI &&
    Boolean(
      reportClientEmbedsError
    );

  const analyticsGroupsBusy =
    form.esPowerBI &&
    (
      isLoadingActiveGroups ||
      isLoadingAnalyticsGroups
    );

  const analyticsGroupsUnavailable =
    form.esPowerBI &&
    Boolean(
      activeGroupsError ||
      analyticsGroupsError
    );

  const parentOptions =
    useMemo(
      () =>
        moduloDetalle
          ? buildEditableParentOptions(
              moduloDetalle,
              modulosExistentes
            )
          : [],
      [
        moduloDetalle,
        modulosExistentes,
      ]
    );

  const orderOptions =
    useMemo(
      () =>
        buildOrderOptions(
          form.padreId,
          moduloId,
          modulosExistentes
        ),
      [
        form.padreId,
        moduloId,
        modulosExistentes,
      ]
    );

  const orderPreview =
    useMemo(
      () =>
        buildOrderPreview(
          form,
          moduloId,
          modulosExistentes
        ),
      [
        form,
        moduloId,
        modulosExistentes,
      ]
    );

  const isRootModule =
    moduloDetalle
      ? (
          Number(
            moduloDetalle
              .nId_OpcionPadre
          ) || 0
        ) === 0
      : false;

  const handleNombreChange =
    useCallback(
      (
        value: string
      ) => {
        handleChange(
          'nombre',
          value
        );

        if (!moduloDetalle) {
          return;
        }

        const nextCode =
          resolveModuloCodeAfterNameChange(
            moduloDetalle,
            value
          );

        if (
          nextCode !==
          form.codigo
        ) {
          handleChange(
            'codigo',
            nextCode
          );
        }
      },
      [
        form.codigo,
        handleChange,
        moduloDetalle,
      ]
    );

  const handleParentChange =
    useCallback(
      (
        parentId: number
      ) => {
        handleChange(
          'padreId',
          parentId
        );

        handleChange(
          'orden',
          resolveOrderAfterParentChange(
            parentId,
            moduloId,
            modulosExistentes
          )
        );
      },
      [
        handleChange,
        moduloId,
        modulosExistentes,
      ]
    );

  const {
    visibleDisabled,
    onVisibleChange,
    onEstadoChange,
  } =
    useModuloAvailabilityControls({
      form,
      moduloId,
      modulos:
        modulosExistentes,
      onChange:
        handleChange,
      setErrors,
    });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_EDITAR_MODULO_TEXTS
          .title
      }
      onClose={handleCancel}
      size="md"
      closeOnEsc={!isSubmitting}
      disableClose={isSubmitting}
    >
      <div
        className={[
          'registrar-modulo-modal',

          isSubmitting
            ? 'registrar-modulo-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={
          isLoading ||
          isSubmitting ||
          analyticsGroupsBusy ||
          analyticsReportClientEmbedsBusy
        }
      >
        {isLoading && (
          <div
            className="editar-modulo-modal__resource-state"
            role="status"
            aria-live="polite"
          >
            <span
              className="editar-modulo-modal__spinner"
              aria-hidden="true"
            />

            <span>
              {
                MODAL_EDITAR_MODULO_TEXTS
                  .loadingDetail
              }
            </span>
          </div>
        )}

        {!isLoading &&
          error && (
            <div className="editar-modulo-modal__resource-error">
              <FeedbackMessage
                variant="error"
                title={
                  MODAL_EDITAR_MODULO_TEXTS
                    .detailErrorTitle
                }
                message={error}
              />

              <div className="editar-modulo-modal__resource-actions">
                <ActionButton
                  label="Reintentar"
                  variant="secondary"
                  size="sm"
                  onClick={refetch}
                />
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          moduloDetalle && (
            <>
              <div className="registrar-modulo-modal__body">
                <ModuloFormFields
                  form={form}
                  errors={errors}
                  parentOptions={
                    parentOptions
                  }
                  codeDisabled
                  parentDisabled={
                    isRootModule ||
                    form.esPowerBI
                  }
                  showPowerBiTypeSelector={
                    false
                  }
                  onNombreChange={
                    handleNombreChange
                  }
                  onDescripcionChange={(value) => {
                    handleChange(
                      'descripcion',
                      value
                    );
                  }}
                  onCodigoChange={(value) => {
                    handleChange(
                      'codigo',
                      value
                    );
                  }}
                  onIconoChange={(value) => {
                    handleChange(
                      'icono',
                      value
                    );
                  }}
                  onUrlBIChange={(value) => {
                    handleChange(
                      'urlBI',
                      value
                    );
                  }}
                  onImagenOpcionChange={(value) => {
                    handleChange(
                      'imagenOpcion',
                      value
                    );
                  }}
                  onEmailOpcionChange={(value) => {
                    handleChange(
                      'emailOpcion',
                      value
                    );
                  }}
                  onPadreChange={
                    handleParentChange
                  }
                  visibleDisabled={
                    visibleDisabled
                  }
                  onVisibleChange={
                    onVisibleChange
                  }
                  onEstadoChange={
                    onEstadoChange
                  }
                  orderControl={
                    <ModuloOrderControl
                      value={form.orden}
                      options={
                        orderOptions
                      }
                      previewItems={
                        orderPreview
                      }
                      error={errors.orden}
                      helpText={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderHelp
                      }
                      previewTitle={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderPreview
                      }
                      disabled={
                        isRootModule
                      }
                      onChange={(value) => {
                        handleChange(
                          'orden',
                          value
                        );
                      }}
                    />
                  }
                />

                {form.esPowerBI && (
                  <>
                    <div className="power-bi-group-selector-spacing">
                      <PowerBiGroupSelector
                        groups={
                          powerBiGroups
                        }
                        value={
                          selectedGroupIds
                        }
                        disabled={
                          isSubmitting ||
                          analyticsGroupsBusy ||
                          analyticsGroupsUnavailable
                        }
                        error={
                          activeGroupsError
                            ? 'No se pudieron cargar los grupos activos.'
                            : analyticsGroupsError
                              ? 'No se pudo cargar la configuración de grupos del tablero.'
                              : groupSelectionError
                        }
                        onChange={(
                          groupIds
                        ) => {
                          setEditedGroupIds(
                            groupIds
                          );
                          setGroupSelectionError(
                            null
                          );
                        }}
                      />
                    </div>

                    {analyticsGroupsUnavailable && (
                      <div className="editar-modulo-modal__resource-actions">
                        <ActionButton
                          label="Reintentar grupos"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            refetchActiveGroups();
                            refetchAnalyticsGroups();
                          }}
                        />
                      </div>
                    )}

                    {hasReportClientConfiguration && (
                      <PowerBiReportClientPublications
                        clients={
                          reportClientPublications
                        }
                        disabled={
                          isSubmitting ||
                          analyticsReportClientEmbedsBusy
                        }
                        onEmbedUrlChange={(
                          clientId,
                          name,
                          embedUrl
                        ) => {
                          setEditedReportClientPublications(
                            reportClientPublications.map(
                              (publication) =>
                                publication.clientId ===
                                  clientId &&
                                publication.name ===
                                  name
                                  ? {
                                      ...publication,
                                      embedUrl,
                                    }
                                  : publication
                            )
                          );
                        }}
                        onGroupIdsChange={(
                          clientId,
                          name,
                          groupIds
                        ) => {
                          setEditedReportClientPublications(
                            reportClientPublications.map(
                              (publication) =>
                                publication.clientId ===
                                  clientId &&
                                publication.name ===
                                  name
                                  ? {
                                      ...publication,
                                      groupIds: [...groupIds],
                                    }
                                  : publication
                            )
                          );
                        }}
                      />
                    )}

                    {reportClientEmbedsError && (
                      <div className="editar-modulo-modal__resource-error">
                        <FeedbackMessage
                          variant="error"
                          title="No se pudieron cargar las publicaciones por cartera"
                          message={
                            reportClientEmbedsError
                          }
                        />

                        <div className="editar-modulo-modal__resource-actions">
                          <ActionButton
                            label="Reintentar publicaciones"
                            variant="secondary"
                            size="sm"
                            onClick={
                              refetchReportClientEmbeds
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <ModuloFormErrorSummary
                  errors={errors}
                  title={
                    MODAL_EDITAR_MODULO_TEXTS
                      .validationSummary
                  }
                />

                {submitError && (
                  <div
                    className="error-summary"
                    role="alert"
                  >
                    <strong>
                      {submitError}
                    </strong>
                  </div>
                )}
              </div>

              <footer className="registrar-modulo-modal__footer">
                <ActionButton
                  label={
                    MODAL_EDITAR_MODULO_TEXTS
                      .submitLabel
                  }
                  loadingLabel={
                    MODAL_EDITAR_MODULO_TEXTS
                      .loadingLabel
                  }
                  loading={isSubmitting}
                  variant="primary"
                  size="md"
                  icon="✓"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (
                      !isDirty &&
                      !groupsDirty &&
                      !reportClientPublicationsDirty
                    ) ||
                    !canEdit ||
                    analyticsGroupsBusy ||
                    analyticsGroupsUnavailable ||
                    analyticsReportClientEmbedsBusy ||
                    analyticsReportClientEmbedsUnavailable ||
                    hasInvalidReportClientPublication ||
                    (
                      form.esPowerBI &&
                      !hasValidGroupSelection
                    )
                  }
                  title={
                    !canEdit
                      ? getMantenerModulosPermissionMessage(
                          'editar'
                        )
                      : undefined
                  }
                  className="registrar-modulo-modal__submit-button"
                />
              </footer>
            </>
          )}
      </div>
    </Modal>
  );
};

export default ModalEditarModulo;
