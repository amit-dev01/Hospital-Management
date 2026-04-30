import { getUserProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import DoctorDashboardContent from "./DoctorDashboardContent";

export default async function DoctorDashboard() {
  const data = await getUserProfile();

  // Protect the route: must be logged in and must be a doctor
  if (!data || !data.user) {
    redirect("/login");
  }

  if (data.profile.role !== "doctor") {
    // Redirect to their respective dashboard if they are not a doctor
    if (data.profile.role === "patient") redirect("/patient/dashboard");
    if (data.profile.role === "admin") redirect("/hospital/dashboard");
    redirect("/login");
  }

  return <DoctorDashboardContent profile={data.profile} roleData={data.roleData} />;
}
