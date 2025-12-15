import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import CVInterviewClient from "@/components/cv/CVInterviewClient";

export default async function CVInterviewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <CVInterviewClient userId={user.id} />;
}
