import { useEffect, useReducer } from 'react';

export interface NullableResourceByIdState<TData> {
  data: TData | null;
  isLoading: boolean;
  error: string | null;
}

type NullableResourceByIdAction<TData> =
  | { type: 'RESET' }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: TData }
  | { type: 'LOAD_ERROR'; error: string };

interface UseNullableResourceByIdParams<TId extends string | number, TData> {
  id: TId | null;
  fetcher: (id: TId, signal: AbortSignal) => Promise<TData>;
  errorMessage: string;
}

const createInitialState = <TData>(): NullableResourceByIdState<TData> => ({
  data: null,
  isLoading: false,
  error: null,
});

function nullableResourceByIdReducer<TData>(
  state: NullableResourceByIdState<TData>,
  action: NullableResourceByIdAction<TData>
): NullableResourceByIdState<TData> {
  switch (action.type) {
    case 'RESET':
      return createInitialState<TData>();

    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        data: action.data,
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
      return {
        data: null,
        isLoading: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export function useNullableResourceById<
  TId extends string | number,
  TData,
>({
  id,
  fetcher,
  errorMessage,
}: UseNullableResourceByIdParams<TId, TData>): NullableResourceByIdState<TData> {
  const [state, dispatch] = useReducer(
    nullableResourceByIdReducer<TData>,
    createInitialState<TData>()
  );

  useEffect(() => {
    if (id === null) {
      dispatch({ type: 'RESET' });
      return;
    }

    const controller = new AbortController();

    dispatch({ type: 'LOAD_START' });

    fetcher(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        const message = err instanceof Error ? err.message : errorMessage;

        dispatch({
          type: 'LOAD_ERROR',
          error: message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [id, fetcher, errorMessage]);

  return state;
}