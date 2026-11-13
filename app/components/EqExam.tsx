"use client";

import { EQ_QUESTIONS, portraitPosition, showChoice } from "@/lib/eqQuestions";

type Lang = "zh-CN" | "zh-TW";

const copy = {
  "zh-CN": {
    eyebrow: "图像情商测验",
    title: "观察人物表情，选择最接近的情绪",
    time: "剩余时间",
    done: (n: number, total: number) => `已完成 ${n} / ${total} 题`,
    hint: "每题选择 1 项",
    question: (n: string) => `第${n}题`,
    prompt: "这个人最可能正在感受什么？",
    submit: "完成情商测验",
    note: "请在 4 分钟内完成；未提交时，时间到将自动提交。",
  },
  "zh-TW": {
    eyebrow: "圖像情商測驗",
    title: "觀察人物表情，選擇最接近的情緒",
    time: "剩餘時間",
    done: (n: number, total: number) => `已完成 ${n} / ${total} 題`,
    hint: "每題選擇 1 項",
    question: (n: string) => `第${n}題`,
    prompt: "這個人最可能正在感受什麼？",
    submit: "完成情商測驗",
    note: "請在 4 分鐘內完成；未提交時，時間到將自動提交。",
  },
} as const;

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function EqExam({
  lang,
  secondsLeft,
  answers,
  onAnswer,
  onSubmit,
}: {
  lang: Lang;
  secondsLeft: number;
  answers: Record<number, string>;
  onAnswer: (index: number, choice: string) => void;
  onSubmit: () => void;
}) {
  const t = copy[lang];
  const simplified = lang === "zh-CN";
  const completed = EQ_QUESTIONS.filter((_, index) => answers[index]).length;
  const progress = Math.round((completed / EQ_QUESTIONS.length) * 100);
  const ready = completed === EQ_QUESTIONS.length;
  const urgent = secondsLeft <= 60;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 pb-6 sm:px-6">
      <div className="sticky top-0 z-30 -mx-4 bg-[#f6f7f4]/92 px-4 pt-3 pb-2 backdrop-blur-md sm:-mx-6 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] leading-none text-[#62717a]">{t.eyebrow}</p>
            <h1 className="mt-1 text-[1.15rem] leading-tight font-bold text-[#101820] sm:text-[1.35rem]">
              {t.title}
            </h1>
          </div>
          <div
            className={`shrink-0 rounded-xl bg-white/85 px-3 py-1.5 text-right shadow-card ${
              urgent ? "text-[#a94636] ring-1 ring-[#a94636]/40" : "text-[#101820]"
            }`}
          >
            <p className="text-[12px] leading-none text-[#62717a]">{t.time}</p>
            <p className="font-en mt-0.5 text-[20px] leading-none font-semibold tabular-nums">
              {formatTime(secondsLeft)}
            </p>
          </div>
        </header>

        <section className="mt-2 rounded-xl bg-white/80 px-3 py-2 shadow-card">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px] font-semibold text-[#62717a]">
            <span>{t.done(completed, EQ_QUESTIONS.length)}</span>
            <span>{t.hint}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#101820]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#087f75] to-[#c1904c] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4">
        {EQ_QUESTIONS.map((question, index) => {
          const number = String(index + 1).padStart(2, "0");
          return (
            <article key={number} className="overflow-hidden rounded-[18px] bg-white/90 shadow-card">
              <h2 className="border-b border-[rgba(32,73,82,0.12)] bg-[#f6faf9] px-4 py-4 text-[15px] font-extrabold text-[#101820] sm:px-5">
                <span>{t.question(number)}</span>
                <span className="ml-2 font-bold">{t.prompt}</span>
              </h2>
              <div className="grid items-center gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(240px,0.72fr)_minmax(320px,1fr)]">
                <div
                  role="img"
                  aria-label={t.prompt}
                  className="aspect-[4/3] w-full rounded-2xl border border-[rgba(32,73,82,0.16)] bg-[#e9eceb] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]"
                  style={{
                    backgroundImage: "url(/eq-human-faces.png)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "500% 300%",
                    backgroundPosition: portraitPosition(index),
                  }}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {question.choices.map((choice, optionIndex) => {
                    const letter = String.fromCharCode(65 + optionIndex);
                    const selected = answers[index] === choice;
                    return (
                      <label
                        key={choice}
                        className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border px-3 text-[14px] font-bold transition ${
                          selected
                            ? "border-[#087f75]/70 bg-[#087f75]/10 text-[#101820]"
                            : "border-[rgba(32,73,82,0.16)] bg-white/80 text-[#101820] hover:border-[#087f75]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`eq-${index}`}
                          value={choice}
                          checked={selected}
                          onChange={() => onAnswer(index, choice)}
                          className="accent-[#087f75]"
                        />
                        <span>{letter}</span>
                        <span>{showChoice(choice, simplified)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-3 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[rgba(32,73,82,0.16)] bg-[#f8faf8]/90 px-4 py-3.5 shadow-[0_14px_36px_rgba(15,35,43,0.08)] backdrop-blur">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!ready}
          className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
            ready
              ? "bg-[#1f8f86] text-white hover:brightness-110"
              : "cursor-not-allowed bg-[#d7ddda] text-[#8b969c]"
          }`}
        >
          {t.submit}
        </button>
        <p className="text-[13px] leading-6 text-[#62717a]">{t.note}</p>
      </div>
    </main>
  );
}
