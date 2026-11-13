import { ObjectId } from "mongodb";
import { getResultsCollection } from "@/lib/mongodb";
import type { ExamId, StoredResult } from "@/lib/results";

const EXAMS: ExamId[] = ["pro", "mgmt", "eq"];

function text(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "提交内容无法读取。" }, { status: 400 });
  }

  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const nickname = text(input.nickname, 40);
  const position = text(input.position, 40);
  const examTitle = text(input.examTitle, 40);
  const examId = EXAMS.includes(input.examId as ExamId) ? (input.examId as ExamId) : null;
  const seconds = number(input.seconds);
  const durationSec = number(input.durationSec);
  const submittedAt = text(input.submittedAt, 40);
  const submittedTime = Date.parse(submittedAt);

  if (!nickname || !position || !examId || !examTitle || seconds === null || durationSec === null || Number.isNaN(submittedTime)) {
    return Response.json({ error: "提交内容不完整。" }, { status: 400 });
  }

  const document = {
    nickname,
    position,
    examId,
    examTitle,
    seconds,
    durationSec,
    auto: input.auto === true,
    remark: text(input.remark, 200),
    language: text(input.language, 10),
    submittedAt: new Date(submittedTime).toISOString(),
    correct: number(input.correct),
    total: number(input.total),
    answered: number(input.answered),
    level: text(input.level, 40),
  };

  try {
    const collection = await getResultsCollection();
    const inserted = await collection.insertOne(document);
    return Response.json({ ok: true, id: inserted.insertedId.toHexString() });
  } catch (error) {
    console.error("Failed to save assessment result", error);
    return Response.json({ error: "暂时无法保存结果，请稍后再试。" }, { status: 500 });
  }
}

const ADMIN_PASSWORD = "159";

export async function GET(request: Request) {
  const admin = request.headers.get("x-admin-password")?.trim() ?? "";
  if (admin) {
    if (admin !== ADMIN_PASSWORD) {
      return Response.json({ error: "密码不正确。" }, { status: 401 });
    }
  } else {
    const expected = process.env.HR_ACCESS_CODE;
    if (!expected) {
      return Response.json({ error: "服务器未配置 HR 查看码。" }, { status: 503 });
    }

    const code = request.headers.get("x-hr-access-code")?.trim() ?? "";
    if (!code || code !== expected) {
      return Response.json({ error: "查看码不正确，请重新输入。" }, { status: 401 });
    }
  }

  try {
    const collection = await getResultsCollection();
    const docs = await collection.find({}).sort({ submittedAt: -1 }).limit(200).toArray();
    const results: StoredResult[] = docs.map((doc) => ({
      id: doc._id instanceof ObjectId ? doc._id.toHexString() : String(doc._id),
      submittedAt: typeof doc.submittedAt === "string" ? doc.submittedAt : "",
      nickname: typeof doc.nickname === "string" ? doc.nickname : "",
      position: typeof doc.position === "string" ? doc.position : "",
      examId: EXAMS.includes(doc.examId) ? doc.examId : "eq",
      examTitle: typeof doc.examTitle === "string" ? doc.examTitle : "",
      seconds: typeof doc.seconds === "number" ? doc.seconds : 0,
      durationSec: typeof doc.durationSec === "number" ? doc.durationSec : 0,
      auto: doc.auto === true,
      remark: typeof doc.remark === "string" ? doc.remark : "",
      language: typeof doc.language === "string" ? doc.language : "",
      correct: typeof doc.correct === "number" ? doc.correct : undefined,
      total: typeof doc.total === "number" ? doc.total : undefined,
      answered: typeof doc.answered === "number" ? doc.answered : undefined,
      level: typeof doc.level === "string" ? doc.level : "",
    }));
    return Response.json({ results });
  } catch (error) {
    console.error("Failed to read assessment results", error);
    return Response.json({ error: "暂时无法读取结果，请稍后再试。" }, { status: 500 });
  }
}
