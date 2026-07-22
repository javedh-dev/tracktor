export function makeLabelHelper<T extends string>(
  map: Record<T, (m: Record<string, (args?: unknown) => string>) => string>,
  defaultKey: T
) {
  return (value: string, m: Record<string, (args?: unknown) => string>): string => {
    return map[value as T]?.(m) ?? map[defaultKey](m);
  };
}
