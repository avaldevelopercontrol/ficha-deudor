import type {
  ComponentProps,
  ReactNode,
} from 'react';

import FormErrorSummary from '../../../components/FormErrorSummary';

import ModuloFormFields from './ModuloFormFields';

interface ModuloModalFormBodyProps {
  formFieldsProps: ComponentProps<
    typeof ModuloFormFields
  >;
  validationTitle: string;
  submitError: string | null;
  children?: ReactNode;
}

export const ModuloModalFormBody = ({
  formFieldsProps,
  validationTitle,
  submitError,
  children,
}: ModuloModalFormBodyProps): ReactNode => (
  <div className="registrar-modulo-modal__body">
    <ModuloFormFields {...formFieldsProps} />

    {children}

    <FormErrorSummary
      errors={formFieldsProps.errors}
      title={validationTitle}
    />

    {submitError && (
      <div
        className="error-summary"
        role="alert"
      >
        <strong>{submitError}</strong>
      </div>
    )}
  </div>
);

export default ModuloModalFormBody;
