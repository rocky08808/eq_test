import type { Metadata } from "next";
import HrResultsPage from "../components/HrResultsPage";

export const metadata: Metadata = {
  title: "HR测评结果",
  description: "查看候选人的岗位、昵称、考试类型、分数、等级和提交时间。",
};

export default function HrResults() {
  return <HrResultsPage />;
}
