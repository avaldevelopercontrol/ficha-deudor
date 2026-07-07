export type FormGridColumns = 1 | 2 | 3 | 4;

export interface SelectOption<TValue extends string | number | boolean = string | number> {
  id: TValue;
  label: string;
}