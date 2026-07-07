import { useCallback } from 'react';

type DireccionCascadeField = 'departamento' | 'provincia' | 'distrito';

interface UseDireccionCascadeFieldsParams {
  handleChange: (field: DireccionCascadeField, value: string) => void;
}

export const useDireccionCascadeFields = ({
  handleChange,
}: UseDireccionCascadeFieldsParams) => {
  const handleDepartamentoChange = useCallback(
    (value: string | number) => {
      handleChange('departamento', String(value));
      handleChange('provincia', '');
      handleChange('distrito', '');
    },
    [handleChange]
  );

  const handleProvinciaChange = useCallback(
    (value: string | number) => {
      handleChange('provincia', String(value));
      handleChange('distrito', '');
    },
    [handleChange]
  );

  return {
    handleDepartamentoChange,
    handleProvinciaChange,
  };
};