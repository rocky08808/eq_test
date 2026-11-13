"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchAdminResults, type ExamId, type StoredResult } from "@/lib/results";

const ACCESS_KEY = "adminPassword";

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

function completionOf(item: StoredResult) {
  if (typeof item.answered === "number" && item.total) {
    return Math.round((item.answered / item.total) * 100);
  }
  if (item.durationSec) return Math.min(100, Math.round((item.seconds / item.durationSec) * 100));
  return 0;
}

export default function AdminPage() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [results, setResults] = useState<StoredResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(nextPassword: string) {
    setLoading(true);
    try {
      const list = await fetchAdminResults(nextPassword);
      setResults(list);
      setUnlocked(true);
      setMessage("");
      sessionStorage.setItem(ACCESS_KEY, nextPassword);
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
    if (passwordRef.current) passwordRef.current.value = saved;
    void load(saved);
  }, []);

  function enter(event?: FormEvent) {
    event?.preventDefault();
    const next = passwordRef.current?.value.trim() ?? "";
    if (!next) {
      setMessage("请输入密码。");
      setUnlocked(false);
      return;
    }
    void load(next);
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-wrap items-end justify-between gap-5 rounded-[24px] border border-[rgba(32,73,82,0.16)] bg-[linear-gradient(135deg,rgba(8,127,117,0.12),rgba(22,47,82,0.1)),rgba(255,255,255,0.86)] px-6 py-7 shadow-[0_14px_36px_rgba(15,35,43,0.08)] sm:px-8">
        <div>
          <p className="font-en mb-3 text-[12px] font-semibold tracking-[0.08em] text-[#62717a] uppercase">
            Admin
          </p>
          <h1 className="text-[clamp(2rem,4vw,3.6rem)] leading-[1.06] font-bold tracking-tight text-[#101820]">
            测评记录
          </h1>
          <p className="mt-2.5 max-w-[680px] text-[16px] leading-[1.7] text-[#62717a]">
            查看已入库的候选人岗位、昵称、分数、等级和提交时间。
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
                {results.length ? `共 ${results.length} 条记录，最新提交在最上方。` : "还没有测评记录。"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void load(sessionStorage.getItem(ACCESS_KEY) || passwordRef.current?.value.trim() || "")}
              disabled={loading}
              className="inline-flex h-[50px] items-center gap-2 rounded-2xl border border-[rgba(32,73,82,0.16)] bg-white/80 px-5 text-[14px] font-semibold text-[#101820] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#101820]/20 border-t-[#087f75]" />
                  刷新中
                </>
              ) : (
                "刷新"
              )}
            </button>
          </div>

          <div className="overflow-x-auto rounded-[18px] border border-[rgba(32,73,82,0.16)] bg-white/75">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="text-[14px] font-extrabold text-[#62717a]">
                  {["提交时间", "昵称", "岗位", "备注", "类型", "分数", "等级", "完成度", "提交方式"].map((label) => (
                    <th key={label} className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4 font-extrabold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3.5 py-4 text-[#101820]">
                      暂无记录。
                    </td>
                  </tr>
                ) : (
                  results.map((item) => (
                    <tr key={item.id} className="text-[14px] text-[#101820]">
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{formatTime(item.submittedAt)}</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4 font-semibold">{item.nickname}</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{item.position}</td>
                      <td className="max-w-[220px] border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{item.remark || "—"}</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{typeLabel[item.examId]}</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">
                        {typeof item.correct === "number" ? `${item.correct}/${item.total ?? 15}` : "—"}
                      </td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{item.level || "—"}</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">{completionOf(item)}%</td>
                      <td className="border-b border-[rgba(32,73,82,0.16)] px-3.5 py-4">
                        {item.auto ? "时间到自动提交" : "提前交卷"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-[24px] border border-[rgba(32,73,82,0.16)] bg-white/85 px-6 py-5 shadow-[0_14px_36px_rgba(15,35,43,0.08)] sm:px-7">
          <span className="mb-3 block text-[17px] font-extrabold text-[#101820]">请输入管理密码</span>
          <form className="flex flex-wrap items-center gap-3" onSubmit={enter}>
            <input
              ref={passwordRef}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="密码"
              onChange={() => {
                if (message) setMessage("");
              }}
              className="h-[50px] w-full max-w-[360px] rounded-[14px] border border-[rgba(25,89,99,0.28)] bg-white px-4 text-[15px] text-[#101820] outline-none placeholder:text-[#8a969c] focus:border-[#087f75]"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-[50px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#04967f,#178aa0_52%,#24467e)] px-6 text-[15px] font-semibold text-white shadow-[0_22px_48px_rgba(8,127,117,0.25)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "正在读取" : "进入"}
            </button>
          </form>
          <p className="mt-2 min-h-5 text-[14px] font-semibold text-[#a94636]">{message}</p>
        </section>
      )}
    </main>
  );
}
