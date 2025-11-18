import { auth } from "@/auth";
import HomePageClient from "@/components/HomePageClient";

export default async function HomePage() {
  const session = await auth();

  return <HomePageClient session={session} />;
}
