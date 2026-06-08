import type { UserSchema } from "@insforge/sdk";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createInsforgeServer } from "@/lib/insforge-server";

export const getCurrentUser = cache(async (): Promise<UserSchema | null> => {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error) {
    console.error("[getCurrentUser] Unable to load current user", error);
    return null;
  }

  return data.user;
});

export const requireUser = cache(async (): Promise<UserSchema> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});
