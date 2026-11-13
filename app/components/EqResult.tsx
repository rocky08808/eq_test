"use client";

type Lang = "zh-CN" | "zh-TW";
type SaveStatus = "pending" | "saved" | "failed";

const copy = {
  "zh-CN": {
    timeoutTitle: "时间结束，情商测验已自动提交",
    timeoutSummary: "测验时间已结束，系统已依目前作答内容计算结果。",
    doneTitle: "情商测验结果",
    grade: "辨识等级",
    score: "答对题数",
    completion: "完成度",
    pending: "结果正在提交给HR后台。",
    saved: "结果已提交。",
    failed: "结果未能写入服务器，请稍后再试。",
    restart: "重新测评",
  },
  "zh-TW": {
    timeoutTitle: "時間結束，情商測驗已自動提交",
    timeoutSummary: "測驗時間已結束，系統已依目前作答內容計算結果。",
    doneTitle: "情商測驗結果",
    grade: "辨識等級",
    score: "答對題數",
    completion: "完成度",
    pending: "結果正在提交給HR後台。",
    saved: "結果已提交。",
    failed: "結果未能寫入伺服器，請稍後再試。",
    restart: "重新測評",
  },
} as const;

export default function EqResult({
  lang,
  timedOut,
  level,
  message,
  correct,
  total,
  completion,
  status,
  onRestart,
}: {
  lang: Lang;
  timedOut: boolean;
  level: string;
  message: string;
  correct: number;
  total: number;
  completion: number;
  status: SaveStatus;
  onRestart: () => void;
}) {
  const t = copy[lang];
  const summary = timedOut ? t.timeoutSummary : message;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 py-8 sm:px-6">
      <section className="rounded-[22px] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(243,249,247,0.78))] px-6 py-7 shadow-card sm:px-8">
        <p className="font-en text-[12px] font-semibold tracking-[0.14em] text-[#62717a] uppercase">
          Exam Result
        </p>
        <h1 className="mt-2 text-[clamp(1.6rem,3vw,2.15rem)] leading-tight font-bold text-[#101820]">
          {timedOut ? t.timeoutTitle : t.doneTitle}
        </h1>
        <p className="mt-2 text-[15px] leading-7 text-[#62717a]">{summary}</p>
      </section>

      <section className="mt-4 grid gap-3.5 sm:grid-cols-3">
        <article className="rounded-[18px] bg-white/90 px-5 py-4 shadow-card">
          <p className="text-[14px] text-[#62717a]">{t.grade}</p>
          <p className="mt-2 text-[28px] leading-tight font-bold text-[#101820]">{level}</p>
        </article>
        <article className="rounded-[18px] bg-white/90 px-5 py-4 shadow-card">
          <p className="text-[14px] text-[#62717a]">{t.score}</p>
          <p className="mt-2 text-[32px] leading-none font-bold text-[#101820]">
            {correct}
            <span className="text-[22px] font-semibold">/{total}</span>
          </p>
        </article>
        <article className="rounded-[18px] bg-white/90 px-5 py-4 shadow-card">
          <p className="text-[14px] text-[#62717a]">{t.completion}</p>
          <p className="mt-2 text-[32px] leading-none font-bold text-[#101820]">{completion}%</p>
        </article>
      </section>

      <p className="mt-4 px-1 text-[14px] text-[#62717a]">{t[status]}</p>

      <button
        type="button"
        onClick={onRestart}
        className="mt-4 h-[54px] w-full rounded-2xl border border-[rgba(32,73,82,0.16)] bg-white/85 text-[15px] font-bold text-[#101820] shadow-card transition hover:bg-white"
      >
        {t.restart}
      </button>
    </main>
  );
}
