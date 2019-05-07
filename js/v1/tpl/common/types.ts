export type Result<T, E, K> = { kind: 'result', result: T } | { kind: 'error', error: E, error_key: K };

export function makeResult<T>(r: T): { kind: 'result', result: T } {
  return { kind: 'result', result: r };
}

export function makeError<T, K>(r: T, k: K): { kind: 'error', error: T, error_key: K } {
  return { kind: 'error', error: r, error_key: k };
}
export type AntdFormEvent = React.FormEvent<any> & { target: { value: string } };
