import { getUserProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import PatientDashboardContent from "./DashboardContent";

export default async function PatientDashboard() {
  const data = await getUserProfile();

  // Protect the route: must be logged in and must be a patient
  if (!data || !data.user) {
    redirect("/login");
  }

  if (data.profile.role !== "patient") {
    // Redirect to their respective dashboard if they are not a patient
    if (data.profile.role === "doctor") redirect("/doctor/dashboard");
    if (data.profile.role === "admin") redirect("/hospital/dashboard");
    redirect("/login");
  }

  return <PatientDashboardContent profile={data.profile} roleData={data.roleData} />;
}
