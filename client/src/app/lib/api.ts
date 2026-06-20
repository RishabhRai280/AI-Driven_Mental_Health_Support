const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiResponse<T> = T;

/**
 * Typed fetch wrapper that attaches the JWT token from localStorage.
 * Throws an Error with the server error message if response is not ok.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("sm_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `API Error ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errMsg);
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ── Typed convenience helpers ─────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

// ── Shared Types ──────────────────────────────────────────────────────────────

export interface WellnessLog {
  id: string;
  type: "chat" | "journal" | "exercise" | "mood";
  title: string;
  preview: string;
  sentiment: string;
  date: string;
  refId?: string;
}

export interface MascotData {
  id: string;
  name: string;
  eggType: string;
  personality: string;
  level: number;
}

export interface PersonaData {
  id: string;
  age: number;
  occupation: string;
  sleepHours: string;
  stressLevel: number;
  selfCareScale: number;
  mentalGoal: string;
  triggers: string[];
}

export interface CalendarDay {
  day: number;
  mood: string | null;
  note: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "user" | "sparky";
  text: string;
  timestamp: string;
  isSafetyAlert?: boolean;
}

export interface Journal {
  id: string;
  title: string;
  body: string;
  sentiment: string;
  created_at: string;
  updated_at: string;
}
