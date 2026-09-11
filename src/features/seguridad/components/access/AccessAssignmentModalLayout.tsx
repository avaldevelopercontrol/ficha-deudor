import type {
  ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';
import {
  ActionButton,
} from '@shared/components/ui';

import type {
  AccessCheckState,
  AccessOptionsFormData,
  AccessPermissionKey,
  AccessPermissionStates,
  AccessTreeItem,
} from '../../domain/accesos/access.types';

import AccessAssignmentErrorSummary from './AccessAssignmentErrorSummary';
import AccessPermissionsPanel from './AccessPermissionsPanel';
import AccessTree from './AccessTree';

export interface AccessAssignmentModalTexts {
  title: string;
  loading: string;
  retry: string;
  optionsTitle: string;
  permissionsTitle: string;
  noSelectedOption: string;
  selectAll: string;
  selectedCountSingular: string;
  selectedCountPlural: string;
  globalPermissionHint: string;
  containerPermissionHint: string;
  singlePermissionHint: string;
  validationTitle: string;
  submit: string;
  submitting: string;
}

interface AccessAssignmentModalLayoutProps {
  isOpen: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  resourceError: string | null;
  isReady: boolean;
  texts: AccessAssignmentModalTexts;
  identity: ReactNode;
  form: AccessOptionsFormData;
  errors: Record<string, string>;
  submitError: string | null;
  treeItems: readonly AccessTreeItem[];
  activeOption: AccessTreeItem | null;
  activePermissionStates: AccessPermissionStates;
  activeSelectAllState: AccessCheckState;
  submitDisabled: boolean;
  submitTitle?: string;
  onClose: () => void;
  onRetry: () => void;
  onActivateOption: (optionId: number) => void;
  onToggleOption: (
    optionId: number,
    selected: boolean
  ) => void;
  onPermissionChange: (
    permission: AccessPermissionKey,
    checked: boolean
  ) => void;
  onSelectAllPermissions: (checked: boolean) => void;
  onSubmit: () => void | Promise<void>;
}

export const AccessAssignmentModalLayout = ({
  isOpen,
  isSubmitting,
  isLoading,
  resourceError,
  isReady,
  texts,
  identity,
  form,
  errors,
  submitError,
  treeItems,
  activeOption,
  activePermissionStates,
  activeSelectAllState,
  submitDisabled,
  submitTitle,
  onClose,
  onRetry,
  onActivateOption,
  onToggleOption,
  onPermissionChange,
  onSelectAllPermissions,
  onSubmit,
}: AccessAssignmentModalLayoutProps): ReactNode => (
  <Modal
    isOpen={isOpen}
    title={texts.title}
    onClose={onClose}
    size="xl"
    closeOnEsc={!isSubmitting}
    disableClose={isSubmitting}
  >
    <div
      className={[
        'asignar-accesos-perfil-modal',
        isSubmitting
          ? 'asignar-accesos-perfil-modal--submitting'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={isSubmitting}
    >
      <div className="asignar-accesos-perfil-modal__body">
        {isLoading && (
          <div
            className="asignar-accesos-perfil-modal__resource-state"
            role="status"
            aria-live="polite"
          >
            <span
              className="asignar-accesos-perfil-modal__spinner"
              aria-hidden="true"
            />
            <span>{texts.loading}</span>
          </div>
        )}

        {!isLoading && resourceError && (
          <div className="asignar-accesos-perfil-modal__resource-error">
            <div
              className="error-summary"
              role="alert"
            >
              <strong>{resourceError}</strong>
            </div>

            <div className="asignar-accesos-perfil-modal__resource-actions">
              <ActionButton
                label={texts.retry}
                variant="secondary"
                size="sm"
                onClick={onRetry}
              />
            </div>
          </div>
        )}

        {isReady && (
          <div className="asignar-accesos-perfil-form">
            {identity}

            <section className="asignar-accesos-perfil-form__access-grid">
              <div className="asignar-accesos-perfil-form__panel">
                <div className="asignar-accesos-perfil-form__panel-header">
                  <strong>{texts.optionsTitle}</strong>

                  <span>
                    {form.selectedOptionIds.length}{' '}
                    {form.selectedOptionIds.length === 1
                      ? texts.selectedCountSingular
                      : texts.selectedCountPlural}
                  </span>
                </div>

                <AccessTree
                  items={treeItems}
                  form={form}
                  disabled={isSubmitting}
                  onActivate={onActivateOption}
                  onToggle={onToggleOption}
                />
              </div>

              <div className="asignar-accesos-perfil-form__panel">
                <AccessPermissionsPanel
                  activeOption={activeOption}
                  permissionStates={activePermissionStates}
                  selectAllState={activeSelectAllState}
                  disabled={isSubmitting}
                  titleLabel={texts.permissionsTitle}
                  noSelectionMessage={texts.noSelectedOption}
                  selectAllLabel={texts.selectAll}
                  globalHint={texts.globalPermissionHint}
                  containerHint={texts.containerPermissionHint}
                  singleHint={texts.singlePermissionHint}
                  onPermissionChange={onPermissionChange}
                  onSelectAll={onSelectAllPermissions}
                />
              </div>
            </section>

            <AccessAssignmentErrorSummary
              errors={errors}
              title={texts.validationTitle}
            />

            {submitError && (
              <div
                className="error-summary asignar-accesos-perfil-modal__submit-error"
                role="alert"
              >
                <strong>{submitError}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="asignar-accesos-perfil-modal__footer">
        <ActionButton
          label={texts.submit}
          loadingLabel={texts.submitting}
          loading={isSubmitting}
          variant="primary"
          size="md"
          icon="✓"
          onClick={() => {
            void onSubmit();
          }}
          disabled={submitDisabled}
          title={submitTitle}
          className="asignar-accesos-perfil-modal__submit-button"
        />
      </footer>
    </div>
  </Modal>
);

export default AccessAssignmentModalLayout;
