import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginFormSkeleton } from "@/components/auth/LoginFormSkeleton";
import { Navbar } from "@/components/layout/Navbar";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-background/68">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1440px] items-center justify-center px-6 py-12">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
