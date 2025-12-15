import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { AccountForm } from "@/components/forms/AccountForm";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-4xl font-semibold text-white">
            Account <span className="text-neon-cyan">Settings</span>
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <AccountForm user={user} />
      </div>
    </section>
  );
}
