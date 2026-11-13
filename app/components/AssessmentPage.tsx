"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import EqExam from "./EqExam";
import EqResult from "./EqResult";
import { EQ_QUESTIONS, eqLevel } from "@/lib/eqQuestions";
import { saveResult, type ExamId } from "@/lib/results";

type Lang = "zh-CN" | "zh-TW";

const POSITIONS = [
  ["策划", "策劃"],
  ["美术", "美術"],
  ["H5", "H5"],
  ["服务端", "服務端"],
  ["客户端", "客戶端"],
  ["运维", "運維"],
  ["人事", "人事"],
  ["运营", "運營"],
  ["后台", "後台"],
  ["客服", "客服"],
  ["财务", "財務"],
  ["行政", "行政"],
  ["其他", "其他"],
] as const;

function positions(pairs: readonly (readonly [string, string])[], lang: Lang) {
  const index = lang === "zh-CN" ? 0 : 1;
  return pairs.map((pair) => ({ value: pair[0], label: pair[index] }));
}

const copy = {
  "zh-CN": {
    langLabel: "请选择考试语言",
    simplified: "简体中文",
    traditional: "繁體中文",
    hrResults: "HR结果查看",
    examRules: "EXAM RULES",
    welcome: ["欢迎参加本公司的候", "选考试"],
    welcomeDesc: "请阅读以下规则后开始作答。开始后系统将自动计时，请在规定时间内完成并提交。",
    rulesTitle: "考试规则",
    fillInfo: "请填写候选人信息",
    position: "应聘岗位",
    positionPh: "请选择岗位",
    nickname: "昵称",
    nicknamePh: "请输入昵称",
    chooseType: "请选择考试类型",
    start: "开始测评",
    required: "请先填写岗位和昵称",
    addRemark: "添加备注",
    hideRemark: "收起备注",
    remark: "备注",
    remarkPh: "选填，例如推荐人或备注",
    confirmTitle: "确认开始测评",
    confirmHint: "开始后将自动计时，时间结束后系统会自动提交。",
    back: "返回修改",
    confirmStart: "确认开始",
    inProgress: "测评进行中",
    timeLeft: "剩余时间",
    candidate: "候选人",
    submit: "提前交卷",
    autoSubmitted: "时间到，系统已自动提交",
    manualSubmitted: "答卷已提交",
    saveFailed: "记录未能写入服务器，请稍后再试。",
    exams: {
      pro: {
        title: "专业岗位候选考试",
        desc: "适用于策划、美术、H5、服务端、客户端、运维、人事、运营等普通岗位",
        rule: "本场为专业岗位综合能力测验，请在 20 分钟内完成全部题目。时间结束后系统会自动提交。",
        durationLabel: "测验时间",
        duration: "20 分钟",
        durationSec: 20 * 60,
        formatLabel: "题目形式",
        format: "综合能力选择题",
        methodLabel: "作答方式",
        method: "每题选择 1 个最合适的答案",
      },
      mgmt: {
        title: "管理岗位候选考试",
        desc: "适用于主管、组长等管理岗位",
        rule: "本场为管理岗位情景测验，请在 15 分钟内完成全部题目。时间结束后系统会自动提交。",
        durationLabel: "测验时间",
        duration: "15 分钟",
        durationSec: 15 * 60,
        formatLabel: "题目形式",
        format: "管理情景选择题",
        methodLabel: "作答方式",
        method: "每题选择 1 个最合适的答案",
      },
      eq: {
        title: "图像情商测验",
        desc: "15题真人表情辨识，观察眉眼、嘴角和整体神态",
        rule: "请观察人物的眉眼、嘴角和整体神态，在 4 分钟内完成 15 道题。时间结束后系统会自动提交。",
        durationLabel: "测验时间",
        duration: "4 分钟",
        durationSec: 4 * 60,
        formatLabel: "题目形式",
        format: "15 题图像情绪辨识",
        methodLabel: "作答方式",
        method: "每题选择 1 个最接近的情绪",
      },
    },
  },
  "zh-TW": {
    langLabel: "請選擇考試語言",
    simplified: "简体中文",
    traditional: "繁體中文",
    hrResults: "HR結果查看",
    examRules: "EXAM RULES",
    welcome: ["歡迎參加本公司的候", "選考試"],
    welcomeDesc: "請閱讀以下規則後開始作答。開始後系統將自動計時，請在規定時間內完成並提交。",
    rulesTitle: "考試規則",
    fillInfo: "請填寫候選人資訊",
    position: "應聘崗位",
    positionPh: "請選擇崗位",
    nickname: "暱稱",
    nicknamePh: "請輸入暱稱",
    chooseType: "請選擇考試類型",
    start: "開始測評",
    required: "請先填寫崗位和暱稱",
    addRemark: "新增備註",
    hideRemark: "收起備註",
    remark: "備註",
    remarkPh: "選填，例如推薦人或備註",
    confirmTitle: "確認開始測評",
    confirmHint: "開始後將自動計時，時間結束後系統會自動提交。",
    back: "返回修改",
    confirmStart: "確認開始",
    inProgress: "測評進行中",
    timeLeft: "剩餘時間",
    candidate: "候選人",
    submit: "提前交卷",
    autoSubmitted: "時間到，系統已自動提交",
    manualSubmitted: "答卷已提交",
    saveFailed: "紀錄未能寫入伺服器，請稍後再試。",
    exams: {
      pro: {
        title: "專業崗位候選考試",
        desc: "適用於策劃、美術、H5、服務端、客戶端、運維、人事、運營等普通崗位",
        rule: "本場為專業崗位綜合能力測驗，請在 20 分鐘內完成全部題目。時間結束後系統會自動提交。",
        durationLabel: "測驗時間",
        duration: "20 分鐘",
        durationSec: 20 * 60,
        formatLabel: "題目形式",
        format: "綜合能力選擇題",
        methodLabel: "作答方式",
        method: "每題選擇 1 個最合適的答案",
      },
      mgmt: {
        title: "管理崗位候選考試",
        desc: "適用於主管、組長等管理崗位",
        rule: "本場為管理崗位情景測驗，請在 15 分鐘內完成全部題目。時間結束後系統會自動提交。",
        durationLabel: "測驗時間",
        duration: "15 分鐘",
        durationSec: 15 * 60,
        formatLabel: "題目形式",
        format: "管理情景選擇題",
        methodLabel: "作答方式",
        method: "每題選擇 1 個最合適的答案",
      },
      eq: {
        title: "圖像情商測驗",
        desc: "15題真人表情辨識，觀察眉眼、嘴角和整體神態",
        rule: "請觀察人物的眉眼、嘴角和整體神態，在 4 分鐘內完成 15 道題。時間結束後系統會自動提交。",
        durationLabel: "測驗時間",
        duration: "4 分鐘",
        durationSec: 4 * 60,
        formatLabel: "題目形式",
        format: "15 題圖像情緒辨識",
        methodLabel: "作答方式",
        method: "每題選擇 1 個最接近的情緒",
      },
    },
  },
} as const;

const examOrder: ExamId[] = ["pro", "mgmt", "eq"];
const disabledExams = new Set<ExamId>(["pro", "mgmt"]);

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-[16px] w-[3px] rounded-full bg-[#1aa37a]" />
      <h2 className="text-[15px] font-semibold tracking-wide text-[#1b2433]">{children}</h2>
    </div>
  );
}

export default function AssessmentPage() {
  const [lang, setLang] = useState<Lang>("zh-CN");
  const [exam, setExam] = useState<ExamId>("eq");
  const [position, setPosition] = useState("");
  const [nickname, setNickname] = useState("");
  const [remark, setRemark] = useState("");
  const [showRemark, setShowRemark] = useState(false);
  const [error, setError] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [notice, setNotice] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{
    timedOut: boolean;
    correct: number;
    total: number;
    answered: number;
    level: string;
    message: string;
    status: "pending" | "saved" | "failed";
  } | null>(null);
  const submitLock = useRef(false);
  const answersRef = useRef<Record<number, string>>({});

  const t = copy[lang];
  const current = t.exams[exam];

  const positionOptions = useMemo(() => positions(POSITIONS, lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  async function finish(auto: boolean) {
    if (submitLock.current) return;
    submitLock.current = true;
    const chosen = answersRef.current;
    const correct = EQ_QUESTIONS.filter((question, index) => chosen[index] === question.answer).length;
    const answered = EQ_QUESTIONS.filter((_, index) => chosen[index]).length;
    const grade = eqLevel(correct, lang);
    setResult({
      timedOut: auto,
      correct,
      total: EQ_QUESTIONS.length,
      answered,
      level: grade.level,
      message: grade.message,
      status: "pending",
    });
    setRunning(false);
    setConfirming(false);
    let saved = false;
    try {
      saved = await saveResult({
        submittedAt: new Date().toISOString(),
        nickname: nickname.trim(),
        position: positionOptions.find((item) => item.value === position)?.label ?? position,
        examId: exam,
        examTitle: current.title,
        seconds: current.durationSec - secondsLeft,
        durationSec: current.durationSec,
        auto,
        remark: remark.trim(),
        language: lang,
        correct,
        total: EQ_QUESTIONS.length,
        answered,
        level: grade.level,
      });
    } catch {
      saved = false;
    }
    setResult((currentResult) =>
      currentResult ? { ...currentResult, status: saved ? "saved" : "failed" } : currentResult,
    );
  }

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!running) {
      submitLock.current = false;
      return;
    }
    if (secondsLeft <= 0) {
      finishRef.current(true);
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, secondsLeft]);

  function handleStartClick() {
    if (!position || !nickname.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    setNotice("");
    answersRef.current = {};
    setAnswers({});
    setSecondsLeft(current.durationSec);
    setRunning(true);
  }

  function restartExam() {
    setResult(null);
    setAnswers({});
    answersRef.current = {};
    setNotice("");
    submitLock.current = false;
  }

  function selectAnswer(index: number, choice: string) {
    const next = { ...answersRef.current, [index]: choice };
    answersRef.current = next;
    setAnswers(next);
  }

  function handleExamChange(next: ExamId) {
    if (disabledExams.has(next)) return;
    setExam(next);
    setError(false);
  }

  const positionLabel = positionOptions.find((item) => item.value === position)?.label ?? position;

  if (result && exam === "eq") {
    return (
      <EqResult
        lang={lang}
        timedOut={result.timedOut}
        level={result.level}
        message={result.message}
        correct={result.correct}
        total={result.total}
        completion={result.total ? Math.round((result.answered / result.total) * 100) : 0}
        status={result.status}
        onRestart={restartExam}
      />
    );
  }

  if (running && exam === "eq") {
    return (
      <EqExam
        lang={lang}
        secondsLeft={secondsLeft}
        answers={answers}
        onAnswer={selectAnswer}
        onSubmit={() => void finish(false)}
      />
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1180px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <header className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-pill">
            <span className="font-en grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-[#2f8fd6] to-[#149a86] text-[11px] font-bold tracking-wide text-white">
              HR
            </span>
            <span className="font-en text-[14px] font-medium tracking-tight text-[#243044]">
              Candidate Assessment
            </span>
          </div>
        </div>

        <div className="order-3 flex w-full justify-center lg:absolute lg:left-1/2 lg:top-1/2 lg:w-auto lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-pill">
            <span className="px-3 text-[13px] text-[#8b95a5]">{t.langLabel}</span>
            <button
              type="button"
              onClick={() => setLang("zh-CN")}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                lang === "zh-CN" ? "bg-[#1a9a78] text-white" : "text-[#2a3444] hover:bg-[#f3f6f8]"
              }`}
            >
              {t.simplified}
            </button>
            <button
              type="button"
              onClick={() => setLang("zh-TW")}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                lang === "zh-TW" ? "bg-[#1a9a78] text-white" : "text-[#2a3444] hover:bg-[#f3f6f8]"
              }`}
            >
              {t.traditional}
            </button>
          </div>
        </div>

        <div>
          <Link
            href="/hr-results"
            className="inline-flex rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#2a6f86] shadow-pill ring-1 ring-[#d7e4ea] transition hover:bg-[#f7fbfc]"
          >
            {t.hrResults}
          </Link>
        </div>
      </header>

      {notice ? (
        <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-white/80 px-4 py-2 text-center text-[13px] text-[#0f7a68] shadow-card">
          {notice}
        </p>
      ) : null}

      {running ? (
        <section className="mx-auto mt-6 max-w-[640px] rounded-[24px] bg-white p-8 shadow-card">
          <p className="text-center text-[13px] tracking-[0.18em] text-[#1aa37a]">{t.inProgress}</p>
          <h1 className="mt-3 text-center text-[26px] font-semibold text-[#172033]">{current.title}</h1>
          <p className="mt-2 text-center text-[13px] text-[#7d8796]">
            {t.candidate} {nickname.trim()} · {positionLabel}
          </p>
          <div className="mt-8 rounded-[20px] bg-gradient-to-br from-[#102033] to-[#12352f] px-6 py-8 text-center text-white">
            <p className="text-[12px] tracking-[0.22em] text-white/60">{t.timeLeft}</p>
            <p className="font-en mt-2 text-[64px] font-semibold leading-none tabular-nums">
              {formatTime(secondsLeft)}
            </p>
          </div>
          <p className="mt-5 text-center text-[13px] leading-6 text-[#667084]">{current.rule}</p>
          <button
            type="button"
            onClick={() => finish(false)}
            className="mt-6 h-[52px] w-full rounded-2xl bg-gradient-to-r from-[#14a394] via-[#0e7d8c] to-[#15607a] text-[15px] font-medium tracking-[0.18em] text-white transition hover:brightness-110"
          >
            {t.submit}
          </button>
        </section>
      ) : (
        <section className="mt-5 grid items-start gap-4 lg:grid-cols-[348px_minmax(0,1fr)] lg:gap-5">
          <div className="flex flex-col gap-3.5">
            <article className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c1b2e] via-[#102433] to-[#12382f] px-7 pb-6 pt-6 text-white shadow-card">
              <div className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-[#1c7a68]/40 blur-3xl" />
              <p className="font-en relative text-[11px] font-medium tracking-[0.22em] text-white/55">
                {t.examRules}
              </p>
              <h1 className="relative mt-4 text-[28px] font-semibold leading-[1.28] tracking-wide">
                {t.welcome[0]}
                <br />
                {t.welcome[1]}
              </h1>
              <div className="relative mt-4 h-px bg-white/15" />
              <p className="relative mt-4 text-[13px] leading-6 text-white/75">{t.welcomeDesc}</p>
            </article>

            <article className="rounded-[22px] bg-white px-5 py-4 shadow-card">
              <SectionTitle>{t.rulesTitle}</SectionTitle>
              <p className="mt-3 text-[13px] leading-6 text-[#6d7786]">{current.rule}</p>
            </article>

            {(
              [
                [current.durationLabel, current.duration],
                [current.formatLabel, current.format],
                [current.methodLabel, current.method],
              ] as const
            ).map(([label, value]) => (
              <article
                key={label}
                className="flex items-center justify-between rounded-[18px] bg-white px-5 py-3.5 shadow-card"
              >
                <div>
                  <p className="text-[12px] text-[#8b95a5]">{label}</p>
                  <p className="mt-1 text-[16px] font-semibold text-[#1b2433]">{value}</p>
                </div>
                <span className="h-[2px] w-7 rounded-full bg-[#d7dee8]" />
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <article className="relative rounded-[22px] bg-white px-5 pb-5 pt-4 shadow-card sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <SectionTitle>{t.fillInfo}</SectionTitle>
                <button
                  type="button"
                  aria-label={showRemark ? t.hideRemark : t.addRemark}
                  title={showRemark ? t.hideRemark : t.addRemark}
                  onClick={() => setShowRemark((open) => !open)}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#8aa0ae] ring-1 ring-[#d5e0e6] transition hover:bg-[#f4fafb] hover:text-[#1a9a78]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    {showRemark ? (
                      <path d="M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    ) : (
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    )}
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[13px] text-[#7c8796]">{t.position}</span>
                  <span className="relative block">
                    <select
                      value={position}
                      onChange={(event) => {
                        setPosition(event.target.value);
                        setError(false);
                      }}
                      className={`h-[46px] w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-[14px] text-[#1b2433] outline-none transition focus:border-[#1a9a78] ${
                        error && !position ? "border-[#e36b6b]" : "border-[#e6ebf1]"
                      }`}
                    >
                      <option value="">{t.positionPh}</option>
                      {positionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#98a2b3]"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M3 5.2 7 9l4-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] text-[#7c8796]">{t.nickname}</span>
                  <input
                    value={nickname}
                    onChange={(event) => {
                      setNickname(event.target.value);
                      setError(false);
                    }}
                    placeholder={t.nicknamePh}
                    className={`h-[46px] w-full rounded-xl border bg-white px-3.5 text-[14px] text-[#1b2433] outline-none transition placeholder:text-[#b0b8c4] focus:border-[#1a9a78] ${
                      error && !nickname.trim() ? "border-[#e36b6b]" : "border-[#e6ebf1]"
                    }`}
                  />
                </label>
              </div>

              {showRemark ? (
                <label className="mt-4 block">
                  <span className="mb-2 block text-[13px] text-[#7c8796]">{t.remark}</span>
                  <input
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)}
                    placeholder={t.remarkPh}
                    className="h-[46px] w-full rounded-xl border border-[#e6ebf1] bg-white px-3.5 text-[14px] text-[#1b2433] outline-none transition placeholder:text-[#b0b8c4] focus:border-[#1a9a78]"
                  />
                </label>
              ) : null}

              {error ? <p className="mt-3 text-[12px] text-[#d45656]">{t.required}</p> : null}
            </article>

            <article className="rounded-[22px] bg-white px-5 py-4 shadow-card sm:px-6">
              <SectionTitle>{t.chooseType}</SectionTitle>
              <div className="mt-4 flex flex-col gap-2.5">
                {examOrder.map((id) => {
                  const item = t.exams[id];
                  const active = exam === id;
                  const disabled = disabledExams.has(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleExamChange(id)}
                      className={`rounded-2xl px-5 py-3.5 text-left transition ${
                        disabled
                          ? "cursor-not-allowed bg-[#f4f6f8] text-[#a0a8b4] ring-1 ring-[#e7edf2]"
                          : active
                            ? "bg-gradient-to-r from-[#0f7380] via-[#14556e] to-[#1a3f62] text-white shadow-[0_10px_24px_rgba(16,70,90,0.18)]"
                            : "bg-white text-[#1b2433] ring-1 ring-[#e7edf2] hover:ring-[#c9d7e0]"
                      }`}
                    >
                      <span className="block text-[15px] font-semibold">{item.title}</span>
                      <span
                        className={`mt-1 block text-[12px] leading-5 ${
                          disabled ? "text-[#b4bcc6]" : active ? "text-white/75" : "text-[#8b95a5]"
                        }`}
                      >
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>

            <button
              type="button"
              onClick={handleStartClick}
              className="h-[58px] rounded-2xl bg-gradient-to-r from-[#14a394] via-[#0e7d8c] to-[#15607a] text-[16px] font-medium tracking-[0.22em] text-white shadow-[0_12px_28px_rgba(14,110,120,0.22)] transition hover:brightness-110"
            >
              {t.start}
            </button>
          </div>
        </section>
      )}

      {confirming ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[#102033]/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-card">
            <h2 className="text-[18px] font-semibold text-[#172033]">{t.confirmTitle}</h2>
            <p className="mt-3 text-[14px] leading-6 text-[#4d5868]">
              {nickname.trim()} · {positionLabel}
              <br />
              {current.title}
              {remark.trim() ? ` · ${remark.trim()}` : ""}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#7d8796]">{t.confirmHint}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-11 rounded-xl bg-[#f4f6f8] text-[14px] text-[#445062]"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-11 rounded-xl bg-[#1a9a78] text-[14px] font-medium text-white"
              >
                {t.confirmStart}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
