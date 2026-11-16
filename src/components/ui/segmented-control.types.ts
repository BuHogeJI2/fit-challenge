export interface ISegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface ISegmentedControlProps<T extends string> {
  label: string;
  options: readonly ISegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}
