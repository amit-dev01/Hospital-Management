import { getUserProfile } from "@/app/actions/auth";
import HomeContent from "./HomeContent";

export default async function Home() {
  const userProfile = await getUserProfile();
  
  return <HomeContent userProfile={userProfile} />;
}
