import { getUserProfile } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import PatientProfileContent from "./ProfileContent";

export default async function PatientProfilePage() {
  const data = await getUserProfile();

  if (!data || !data.user) redirect("/login");
  if (data.profile.role !== "patient") redirect("/patient/dashboard");

  return <PatientProfileContent profile={data.profile} roleData={data.roleData} user={data.user} />;
}
