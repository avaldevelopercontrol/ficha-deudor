import Paginacion from '@shared/components/ui/Paginacion';
import { DOCUMENTOS_PAGE_SIZE_OPTIONS } from '../../constants/documentosTable.constants';

interface Props {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageNumberChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const DocumentosPagination: React.FC<Props> = ({
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  onPageNumberChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 0) return null;

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

  const handlePaginaAnterior = () => {
    onPageNumberChange(Math.max(1, pageNumber - 1));
  };

  const handlePaginaSiguiente = () => {
    onPageNumberChange(Math.min(totalPages, pageNumber + 1));
  };

  return (
    <Paginacion
      paginaActual={pageNumber}
      totalPaginas={totalPages}
      totalRegistros={totalRecords}
      indiceInicio={indiceInicio}
      indiceFin={indiceFin}
      onPaginaAnterior={handlePaginaAnterior}
      onPaginaSiguiente={handlePaginaSiguiente}
      onIrAPagina={onPageNumberChange}
      showPageSizeSelector={true}
      pageSize={pageSize}
      pageSizeOptions={DOCUMENTOS_PAGE_SIZE_OPTIONS}
      onPageSizeChange={onPageSizeChange}
    />
  );
};

export default DocumentosPagination;