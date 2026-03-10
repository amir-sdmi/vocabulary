export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  const maybeJson = (await response.json().catch(() => null)) as { error?: string } | null;
  if (maybeJson?.error) return maybeJson.error;
  return `${response.status} ${response.statusText}`.trim();
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }
  return (await response.json()) as T;
}

export async function fetchJsonOrNull<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T | null> {
  try {
    return await fetchJson<T>(input, init);
  } catch {
    return null;
  }
}

export async function postJson<TResponse>(
  input: RequestInfo | URL,
  body: unknown,
  init?: Omit<RequestInit, "body" | "method">,
): Promise<TResponse> {
  return fetchJson<TResponse>(input, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function patchJson<TResponse>(
  input: RequestInfo | URL,
  body: unknown,
  init?: Omit<RequestInit, "body" | "method">,
): Promise<TResponse> {
  return fetchJson<TResponse>(input, {
    ...init,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}
