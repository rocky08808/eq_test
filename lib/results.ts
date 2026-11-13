export type ExamId = "pro" | "mgmt" | "eq";

export type StoredResult = {
  id: string;
  submittedAt: string;
  nickname: string;
  position: string;
  examId: ExamId;
  examTitle: string;
  seconds: number;
  durationSec: number;
  auto: boolean;
  remark?: string;
  language?: string;
  correct?: number;
  total?: number;
  answered?: number;
  level?: string;
};

export type ResultInput = Omit<StoredResult, "id">;

export async function saveResult(item: ResultInput) {
  const response = await fetch("/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return response.ok;
}

export async function fetchAdminResults(password: string): Promise<StoredResult[]> {
  const response = await fetch("/api/results", {
    headers: { "x-admin-password": password },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    results?: StoredResult[];
  };
  if (!response.ok) {
    throw new Error(data.error || "暂时无法读取结果，请稍后再试。");
  }
  return Array.isArray(data.results) ? data.results : [];
}

export async function fetchResults(code: string): Promise<StoredResult[]> {
  const response = await fetch("/api/results", {
    headers: { "x-hr-access-code": code },
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    results?: StoredResult[];
  };
  if (!response.ok) {
    throw new Error(data.error || "暂时无法读取结果，请稍后再试。");
  }
  return Array.isArray(data.results) ? data.results : [];
}
