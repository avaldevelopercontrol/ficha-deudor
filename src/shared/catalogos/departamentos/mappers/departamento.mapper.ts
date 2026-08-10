import type {
  Departamento,
  DepartamentoApi,
} from '../types/departamento.types';

export const mapDepartamentos = (
  data: DepartamentoApi[]
): Departamento[] =>
  data.map((item) => ({
    id: String(
      item.nId_Departamento
    ),

    nombre:
      item.cNombre_Departamento
        .trim(),
  }));