export type EqQuestion = {
  answer: string;
  choices: string[];
};

export const EQ_QUESTIONS: EqQuestion[] = [
  { answer: "克制的喜悅", choices: ["禮貌性微笑", "克制的喜悅", "緊張掩飾", "自我滿足"] },
  { answer: "失望", choices: ["失望", "內疚", "疲憊", "不耐煩"] },
  { answer: "壓抑的憤怒", choices: ["厭惡", "壓抑的憤怒", "戒備", "輕蔑"] },
  { answer: "突然驚訝", choices: ["恐懼", "困惑", "突然驚訝", "興奮"] },
  { answer: "焦慮與害怕", choices: ["悲傷", "焦慮與害怕", "尷尬", "驚訝"] },
  { answer: "輕微厭惡", choices: ["懷疑", "輕微厭惡", "憤怒", "輕蔑"] },
  { answer: "平靜中立", choices: ["冷漠", "平靜中立", "壓抑悲傷", "不耐煩"] },
  { answer: "困惑", choices: ["懷疑", "擔憂", "困惑", "戒備"] },
  { answer: "輕蔑", choices: ["厭惡", "自信", "輕蔑", "克制笑意"] },
  { answer: "擔憂", choices: ["擔憂", "失望", "害怕", "悲傷"] },
  { answer: "含蓄的興奮", choices: ["滿足", "含蓄的興奮", "禮貌微笑", "鬆一口氣"] },
  { answer: "懷疑", choices: ["不耐煩", "困惑", "懷疑", "輕蔑"] },
  { answer: "尷尬", choices: ["羞愧", "尷尬", "內疚", "緊張"] },
  { answer: "強忍悲傷", choices: ["失望", "疲憊", "強忍悲傷", "擔憂"] },
  { answer: "滿足", choices: ["自豪", "放鬆", "滿足", "含蓄喜悅"] },
];

const SIMP: Record<string, string> = {
  禮: "礼",
  悅: "悦",
  緊: "紧",
  張: "张",
  飾: "饰",
  內: "内",
  憊: "惫",
  煩: "烦",
  厭: "厌",
  惡: "恶",
  壓: "压",
  憤: "愤",
  備: "备",
  輕: "轻",
  懼: "惧",
  驚: "惊",
  訝: "讶",
  興: "兴",
  奮: "奋",
  傷: "伤",
  慮: "虑",
  與: "与",
  尷: "尴",
  懷: "怀",
  靜: "静",
  擔: "担",
  憂: "忧",
  滿: "满",
  鬆: "松",
  氣: "气",
  強: "强",
};

export function showChoice(text: string, simplified: boolean) {
  if (!simplified) return text;
  return [...text].map((char) => SIMP[char] ?? char).join("");
}

export function portraitPosition(index: number) {
  const x = [0, 25, 50, 75, 100][index % 5];
  const y = Math.floor(index / 5) * 50;
  return `${x}% ${y}%`;
}

const LEVELS = {
  "zh-CN": [
    { min: 13, level: "细微情绪辨识能力优秀", message: "你能捕捉微妙线索，并区分外观相近的情绪。" },
    { min: 10, level: "情绪辨识能力良好", message: "你通常能准确理解他人的神态，少数含蓄表情仍可能造成混淆。" },
    { min: 7, level: "情绪辨识能力中等", message: "明显情绪容易掌握，但混合或被压抑的情绪仍有挑战。" },
    { min: 0, level: "可以加强细节观察", message: "尝试把眉毛、眼周紧张程度及嘴角变化放在一起判断。" },
  ],
  "zh-TW": [
    { min: 13, level: "細微情緒辨識能力優秀", message: "你能捕捉微妙線索，並區分外觀相近的情緒。" },
    { min: 10, level: "情緒辨識能力良好", message: "你通常能準確理解他人的神態，少數含蓄表情仍可能造成混淆。" },
    { min: 7, level: "情緒辨識能力中等", message: "明顯情緒容易掌握，但混合或被壓抑的情緒仍有挑戰。" },
    { min: 0, level: "可以加強細節觀察", message: "嘗試把眉毛、眼周緊張程度及嘴角變化放在一起判斷。" },
  ],
} as const;

export function eqLevel(correct: number, lang: "zh-CN" | "zh-TW" = "zh-CN") {
  return LEVELS[lang].find((item) => correct >= item.min) ?? LEVELS[lang][LEVELS[lang].length - 1];
}
