export const formatGestionDeudorMoney = (value: number): string => {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
