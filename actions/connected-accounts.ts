"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  clearLinkedInConnectionStatusFields,
  getLinkedInConnectionStatusFields,
} from "@/lib/linkedin-connection";
import { createInsforgeServer } from "@/lib/insforge-server";
import { describeError } from "@/lib/resume-storage";

export type ConnectedAccountActionState =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function linkSavedLinkedInProfile(): Promise<ConnectedAccountActionState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in again before linking LinkedIn.",
      };
    }

    const insforge = await createInsforgeServer();
    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("linkedin_url")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "[linkSavedLinkedInProfile] Unable to load profile",
        describeError(profileError),
      );
      return {
        success: false,
        message: "We could not load your profile. Please try again.",
      };
    }

    if (!profile?.linkedin_url?.trim()) {
      return {
        success: false,
        message: "Add your LinkedIn URL in Profile Information, then save your profile first.",
      };
    }

    const { error: updateError } = await insforge.auth.setProfile(
      getLinkedInConnectionStatusFields("profile_linked"),
    );

    if (updateError) {
      console.error(
        "[linkSavedLinkedInProfile] LinkedIn profile link save failed",
        describeError(updateError),
      );
      return {
        success: false,
        message: "We could not link your saved LinkedIn profile. Please try again.",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "Saved LinkedIn profile linked.",
    };
  } catch (error) {
    console.error(
      "[linkSavedLinkedInProfile] Unexpected failure",
      describeError(error),
    );
    return {
      success: false,
      message: "We could not link your LinkedIn profile. Please try again.",
    };
  }
}

export async function disconnectLinkedInAccount(): Promise<ConnectedAccountActionState> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        message: "Please sign in again before disconnecting LinkedIn.",
      };
    }

    const insforge = await createInsforgeServer();
    const { error: updateError } = await insforge.auth.setProfile(
      clearLinkedInConnectionStatusFields(),
    );

    if (updateError) {
      console.error(
        "[disconnectLinkedInAccount] LinkedIn disconnect failed",
        describeError(updateError),
      );
      return {
        success: false,
        message: "We could not disconnect LinkedIn. Please try again.",
      };
    }

    revalidatePath("/profile");

    return {
      success: true,
      message: "LinkedIn disconnected.",
    };
  } catch (error) {
    console.error(
      "[disconnectLinkedInAccount] Unexpected failure",
      describeError(error),
    );
    return {
      success: false,
      message: "We could not disconnect LinkedIn. Please try again.",
    };
  }
}
