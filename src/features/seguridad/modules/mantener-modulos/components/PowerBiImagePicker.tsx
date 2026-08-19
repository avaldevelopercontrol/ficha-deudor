import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  POWER_BI_IMAGE_CATALOG,
  findPowerBiImageDefinition,
} from '../constants/powerBiImageCatalog.constants';

interface PowerBiImagePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const normalizeSearchText = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

export const PowerBiImagePicker = ({
  id,
  label = 'Logo del reporte',
  value,
  onChange,
  error,
  disabled = false,
}: PowerBiImagePickerProps): ReactNode => {
  const generatedId = useId();
  const controlId =
    id ?? `power-bi-image-picker-${generatedId}`;
  const panelId = `${controlId}-panel`;
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] =
    useState(false);
  const [query, setQuery] =
    useState('');

  const normalizedValue = value.trim();
  const selectedImage =
    findPowerBiImageDefinition(
      normalizedValue
    );
  const hasCustomImage =
    Boolean(normalizedValue) &&
    selectedImage === null;

  const filteredImages = useMemo(() => {
    const normalizedQuery =
      normalizeSearchText(query);

    if (!normalizedQuery) {
      return POWER_BI_IMAGE_CATALOG;
    }

    return POWER_BI_IMAGE_CATALOG.filter(
      (image) =>
        normalizeSearchText(
          image.label
        ).includes(normalizedQuery)
    );
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent
    ) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !containerRef.current?.contains(
          target
        )
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );
    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen]);

  const selectImage = (
    imageSrc: string
  ) => {
    onChange(imageSrc);
    setIsOpen(false);
  };

  return (
    <div className="form-row-inline">
      <label
        className="form-label form-label--inline"
        htmlFor={controlId}
      >
        {label}
      </label>

      <div
        ref={containerRef}
        className="power-bi-image-picker"
      >
        <button
          id={controlId}
          type="button"
          className={[
            'power-bi-image-picker__trigger',
            error
              ? 'power-bi-image-picker__trigger--error'
              : '',
            isOpen
              ? 'power-bi-image-picker__trigger--open'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => {
            setIsOpen(
              (current) => !current
            );
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={panelId}
          disabled={disabled}
        >
          <span className="power-bi-image-picker__selection-preview">
            {normalizedValue ? (
              <img
                src={normalizedValue}
                alt=""
              />
            ) : (
              <span aria-hidden="true">
                +
              </span>
            )}
          </span>

          <span className="power-bi-image-picker__selection-copy">
            <span className="power-bi-image-picker__selection-label">
              {selectedImage?.label ??
                (hasCustomImage
                  ? 'Imagen personalizada'
                  : 'Seleccionar logo')}
            </span>

            <span className="power-bi-image-picker__selection-help">
              {selectedImage
                ? 'Logo seleccionado'
                : hasCustomImage
                  ? 'URL personalizada'
                  : `${POWER_BI_IMAGE_CATALOG.length} logos disponibles`}
            </span>
          </span>

          <span
            className="power-bi-image-picker__chevron"
            aria-hidden="true"
          >
            {isOpen ? '▲' : '▼'}
          </span>
        </button>

        {isOpen && (
          <div
            id={panelId}
            className="power-bi-image-picker__panel"
          >
            <input
              className="power-bi-image-picker__search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(
                  event.target.value
                );
              }}
              placeholder="Buscar logo"
              aria-label="Buscar logo de reporte"
              autoComplete="off"
            />

            <div
              className="power-bi-image-picker__grid"
              role="listbox"
              aria-label="Logos disponibles para Power BI"
            >
              {!query.trim() && (
                <button
                  type="button"
                  role="option"
                  aria-selected={
                    !normalizedValue
                  }
                  className={[
                    'power-bi-image-picker__option',
                    !normalizedValue
                      ? 'power-bi-image-picker__option--selected'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    selectImage('');
                  }}
                >
                  <span className="power-bi-image-picker__option-empty">
                    —
                  </span>
                  <span>
                    Sin logo
                  </span>
                </button>
              )}

              {filteredImages.map(
                (image) => {
                  const isSelected =
                    image.src ===
                    normalizedValue;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      className={[
                        'power-bi-image-picker__option',
                        isSelected
                          ? 'power-bi-image-picker__option--selected'
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => {
                        selectImage(
                          image.src
                        );
                      }}
                      title={image.label}
                    >
                      <span className="power-bi-image-picker__option-image">
                        <img
                          src={image.src}
                          alt=""
                          loading="lazy"
                        />
                      </span>
                      <span>
                        {image.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {filteredImages.length ===
              0 && (
              <p className="power-bi-image-picker__empty-message">
                No se encontraron logos.
              </p>
            )}

            <div className="power-bi-image-picker__custom">
              <label
                htmlFor={`${controlId}-custom`}
              >
                Otra imagen por URL (opcional)
              </label>
              <input
                id={`${controlId}-custom`}
                type="url"
                value={
                  hasCustomImage
                    ? normalizedValue
                    : ''
                }
                onChange={(event) => {
                  onChange(
                    event.target.value
                  );
                }}
                placeholder="https://.../logo.webp"
                autoComplete="off"
              />
              <small>
                Úselo solo si el logo no está en el catálogo.
              </small>
            </div>
          </div>
        )}

        {error && (
          <span className="form-error">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

export default PowerBiImagePicker;
