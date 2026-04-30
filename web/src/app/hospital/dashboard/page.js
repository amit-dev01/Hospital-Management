import { getUserProfile, getUnverifiedDoctors } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import HospitalDashboardContent from "./HospitalDashboardContent";

export default async function HospitalDashboard() {
  const data = await getUserProfile();

  // Protect the route: must be logged in
  if (!data || !data.user) {
    redirect("/login");
  }

  // Check if they have the admin role (or if we want to allow hospital role as well)
  if (data.profile.role !== "admin" && data.profile.role !== "hospital") {
    // Redirect to their respective dashboard if they are not an admin
    if (data.profile.role === "patient") redirect("/patient/dashboard");
    if (data.profile.role === "doctor") redirect("/doctor/dashboard");
    redirect("/login");
  }

  const unverifiedDoctors = await getUnverifiedDoctors();

  return <HospitalDashboardContent profile={data.profile} unverifiedDoctors={unverifiedDoctors} />;
}
