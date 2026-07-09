import type {
  CabeceraPantallaApi,
  ColumnApi,
} from '../../../shared/types';

export function mapCabecerasToColumns(
  cabeceras: CabeceraPantallaApi[]
): ColumnApi[] {
  const ordenadas = [...cabeceras].sort((a, b) => a.orden - b.orden);

  return ordenadas.map((cabecera, index) => ({
    key: getDynamicFieldKey(index),
    label: cabecera.tituloCabeceraPantalla,
    type: inferTypeFromCabecera(cabecera),
  }));
}

function getDynamicFieldKey(index: number): string {
  return `dyn_${index}`;
}

function inferTypeFromCabecera(
  cabecera: CabeceraPantallaApi
): ColumnApi['type'] {
  const tipoDato = cabecera.tipoDato.toUpperCase();
  const titulo = cabecera.tituloCabeceraPantalla.toLowerCase();

  if (tipoDato === 'MONEY') return 'money';
  if (titulo.includes('atraso')) return 'atraso';
  if (titulo.includes('vencimiento') || titulo.includes('fecha')) return 'date';
  if (titulo === 'estado' || titulo.includes('estado_')) return 'estado';

  return 'text';
}