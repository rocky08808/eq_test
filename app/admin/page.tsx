import type { Metadata } from "next";
import AdminPage from "../components/AdminPage";

export const metadata: Metadata = {
  title: "测评记录",
  description: "查看已入库的候选人测评记录。",
};

export default function Admin() {
  return <AdminPage />;
}
