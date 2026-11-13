"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchResults, type ExamId, type StoredResult } from "@/lib/results";

const ACCESS_KEY = "hrAccessCode";

const typeLabel: Record<ExamId, string> = {
  pro: "专业岗位",
  mgmt: "管理岗位",
  eq: "图像情商",
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HrResultsPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [results, setResults] = useState<StoredResult[]>([]);
  const [filter, setFilter] = useState<"" | ExamId>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(nextCode: string) {
    setLoading(true);
    try {
      const list = await fetchResults(nextCode);
      setResults(list);
      setUnlocked(true);
      setMessage("");
      setSelectedId(null);
      sessionStorage.setItem(ACCESS_KEY, nextCode);
    } catch (error) {
      setUnlocked(false);
      setResults([]);
      sessionStorage.removeItem(ACCESS_KEY);
      setMessage(error instanceof Error ? error.message : "暂时无法读取结果，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(ACCESS_KEY) || "";
    if (!saved) return;
    setCode(saved);
    void load(saved);
  }, []);

  const visible = useMemo(
    () => (filter ? results.filter((item) => item.examId === filter) : results),
    [filter, results],
  );

  const selected = results.find((item) => item.id === selectedId) ?? null;

  function viewResults() {
    const next = code.trim();
    if (!next) {
      setMessage("请先输入 HR 查看码。");
      setUnlocked(false);
      return;
    }
    void load(next);
  }

  function refresh() {
    const saved = sessionStorage.getItem(ACCESS_KEY) || code.trim();
    if (saved) void load(saved);
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-wrap items-end justify-between gap-5 rounded-[24px] border border-[rgba(32,73,82,0.16)] bg-[linear-gradient(135deg,rgba(8,127,117,0.12),rgba(22,47,82,0.1)),rgba(255,255,255,0.86)] px-6 py-7 shadow-[0_14px_36px_rgba(15,35,43,0.08)] sm:px-8">
        <div>
          <p className="font-en mb-3 text-[12px] font-semibold tracking-[0.08em] text-[#62717a] uppercase">
            HR Results
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.6rem)] leading-[1.06] font-bold tracking-tight text-[#101820]">
            候选测评结果中心
          </h1>
          <p className="mt-2.5 max-w-[680px] text-[16px] leading-[1.7] text-[#62717a]">
            查看候选人的岗位、昵称、考试类型、分数、等级和提交时间。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[54px] items-center justify-center rounded-2xl border border-[rgba(32,73,82,0.16)] bg-white/80 px-6 text-[15px] font-semibold text-[#101820] transition hover:bg-white"
        >
          返回测评入口
        </Link>
      </section>

      {unlocked ? (
        <section className="mt-4 rounded-[24px] border border-[rgba(32,73,82,0.16)] bg-white/85 p-5 shadow-[0_14px_36px_rgba(15,35,43,0.08)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-extrabold text-[#101820]">结果列表</h2>
              <p className="mt-1 text-[14px] text-[#62717a]">
                {visible.length
                  ? `共 ${visible.length} 条结果，最新提交在最上方。`
                  : "暂无符合条件的测评结果。"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                aria-label="按考试类型筛选"
                value={filter}
                onChange={(event) => setFilter(event.target.value as "" | ExamId)}
                className="h-[50px] rounded-[14px] border border-[rgba(25,89,99,0.28)] bg-white px-4 text-[14px] text-[#101820] outline-none"
              >
                <option value="">全部类型</option>
                <option value="pro">专业岗位</option>
                <option value="mgmt">管理岗位</option>
                <option value="eq">图像情商</option>
              </select>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex h-[50px] items-center rounded-2xl border border-[rgba(32,73,82,0.16)] bg-white/80 px-5 text-[14px] font-semibold text-[#101820]"
              >
                刷新
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-[18px] border border-[rgba(32,73,82,0.16)] bg-white/75">
            <table className="w-full min-w-[930px] border-collapse text-left">
              <thead>
                <tr className="text-[14px] font-extrabold text-[#62717a]">
                  {["提交时间", "昵称", "岗位", "类型", "分数", "等级", "完成度", "分析"].map((label) => (
                    <th key={label} className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4 font-extrabold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3.5 py-4 text-[#101820]">
                      暂无结果。
                    </td>
                  </tr>
                ) : (
                  visible.map((item) => {
                    const completion =
                      typeof item.answered === "number" && item.total
                        ? Math.round((item.answered / item.total) * 100)
                        : item.durationSec
                          ? Math.min(100, Math.round((item.seconds / item.durationSec) * 100))
                          : 0;
                    return (
                      <tr key={item.id} className="text-[14px] text-[#101820]">
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{formatTime(item.submittedAt)}</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4 font-semibold">{item.nickname}</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{item.position}</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{typeLabel[item.examId]}</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">
                          {typeof item.correct === "number" ? `${item.correct}/${item.total ?? 15}` : "—"}
                        </td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{item.level || "—"}</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{completion}%</td>
                        <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#162f52] to-[#087f75] px-3.5 py-2.5 text-left text-white shadow-[0_8px_20px_rgba(22,47,82,0.16)]"
                          >
                            <span>
                              <small className="block text-[10px] tracking-[0.08em] text-white/70">
                                {item.examId === "eq" ? "TEST RESULT" : "PERSONAL REPORT"}
                              </small>
                              {item.examId === "eq" ? "查看测试结果" : "个人评价报告"}
                            </span>
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">→</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {selected ? (
            <article className="mt-4 rounded-[18px] border border-[rgba(32,73,82,0.16)] bg-[#f7faf9] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-en text-[12px] font-semibold tracking-[0.08em] text-[#62717a] uppercase">
                    Candidate Insight
                  </p>
                  <h3 className="mt-1 text-[22px] font-bold text-[#101820]">个人结果分析</h3>
                  <p className="mt-1 text-[14px] text-[#62717a]">
                    {selected.nickname} · {selected.position} · {selected.examTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="rounded-2xl border border-[rgba(32,73,82,0.16)] bg-white px-4 py-2 text-[14px] text-[#101820]"
                >
                  返回列表
                </button>
              </div>
              <p className="mt-4 text-[14px] leading-7 text-[#3d4b55]">
                提交时间 {formatTime(selected.submittedAt)}。用时{" "}
                {Math.floor(selected.seconds / 60)} 分 {selected.seconds % 60} 秒。
                {selected.auto ? "时间结束后由系统自动提交。" : "由候选人提前交卷。"}
              </p>
            </article>
          ) : null}
        </section>
      ) : (
        <section className="mt-4 rounded-[24px] border border-[rgba(32,73,82,0.16)] bg-white/85 px-6 py-5 shadow-[0_14px_36px_rgba(15,35,43,0.08)] sm:px-7">
          <span className="mb-3 block text-[17px] font-extrabold text-[#101820]">请输入 HR 查看码</span>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              value={code}
              autoComplete="current-password"
              placeholder="HR查看码"
              onChange={(event) => {
                setCode(event.target.value);
                if (message) setMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") viewResults();
              }}
              className="h-[50px] w-full max-w-[360px] rounded-[14px] border border-[rgba(25,89,99,0.28)] bg-white px-4 text-[15px] text-[#101820] outline-none placeholder:text-[#8a969c] focus:border-[#087f75]"
            />
            <button
              type="button"
              onClick={viewResults}
              disabled={loading}
              className="inline-flex h-[50px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#04967f,#178aa0_52%,#24467e)] px-6 text-[15px] font-semibold text-white shadow-[0_22px_48px_rgba(8,127,117,0.25)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "正在读取" : "查看结果"}
            </button>
          </div>
          <p className="mt-2 min-h-5 text-[14px] font-semibold text-[#a94636]">{message}</p>
        </section>
      )}
    </main>
  );
}
