import { LoginFormSkeleton } from "@/components/auth/LoginFormSkeleton";
import { Navbar } from "@/components/layout/Navbar";

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background/68">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1440px] items-center justify-center px-6 py-12">
        <LoginFormSkeleton />
      </main>
    </div>
  );
}
