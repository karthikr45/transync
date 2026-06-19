import { getToken } from "./auth";
import type { ApiEnvelope } from "./types.api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  statusCode: number;
  fieldErrors?: Record<string, string[]>;
  constructor(message: string, statusCode: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}

type ErrorBody = {
  statusCode?: number;
  error?: string;
  message?: unknown;
  status?: string;
};

function parseErrorMessage(body: ErrorBody | null, fallback: string): { message: string; fields?: Record<string, string[]> } {
  if (!body) return { message: fallback };
  // Validation Failed shape: message is an object mapping fields -> string[]
  if (body.error === "Validation Failed" && body.message && typeof body.message === "object") {
    const fields = body.message as Record<string, string[]>;
    const first = Object.values(fields).flat()[0];
    return { message: first ?? "Validation failed", fields };
  }
  if (typeof body.message === "string") return { message: body.message };
  return { message: fallback };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Network error — could not reach the server.", 0);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // empty / non-JSON body
  }

  if (!res.ok) {
    const { message, fields } = parseErrorMessage(body as ErrorBody, res.statusText || "Request failed");
    const code = (body as ErrorBody)?.statusCode ?? res.status;
    throw new ApiError(message, code, fields);
  }

  // 2xx but envelope says Failure/Error → still treat as error per spec
  if (body && typeof body === "object" && "status" in body) {
    const env = body as ApiEnvelope<T>;
    if (env.status === "Failure" || env.status === "Error") {
      throw new ApiError(env.message || "Request failed", env.statusCode ?? 400);
    }
    return env.result;
  }

  return body as T;
}

// ---------- Home Care endpoints ----------

import type { LoginDto, LoginResult, RegisterDto, AccountUser } from "./types.api";

export const homeCareApi = {
  register: (dto: RegisterDto) =>
    apiFetch<AccountUser>("/home-care/register", { method: "POST", body: JSON.stringify(dto) }),

  login: (dto: LoginDto) =>
    apiFetch<LoginResult>("/home-care/login", { method: "POST", body: JSON.stringify(dto) }),
};
