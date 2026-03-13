import { Metadata } from "next";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard | Archway",
  description: "Manage your system architecture projects.",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardClient />
    </>
  );
}
