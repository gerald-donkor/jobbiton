import { LoginFormSkeleton } from "@/components/auth/LoginFormSkeleton";
import { Navbar } from "@/components/layout/Navbar";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background/68">
      <Navbar />
      <main className="mx-auto flex min-h-svh w-full max-w-[1440px] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <LoginFormSkeleton />
      </main>
    </div>
  );
}
