export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; err: E }

export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  return new Error(String(error))
}

export async function tryAsResult<T>(func: () => Promise<T>): Promise<Result<T>> {
  try {
    return {
      ok: true,
      value: await func(),
    }
  } catch (error: unknown) {
    return {
      ok: false,
      err: ensureError(error),
    }
  }
}
