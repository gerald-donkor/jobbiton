import { createInsforgeServer } from "@/lib/insforge-server";
import {
  getResumeStoragePath,
  getUserResumeStoragePaths,
  RESUME_BUCKET,
} from "@/lib/resume-files";

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

export type ReplaceUserResumeResult =
  | {
      success: true;
      resumePdfUrl: string;
    }
  | {
      success: false;
      error: string;
    };

export type RemoveUserResumeResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

function readErrorProperty(error: unknown, key: string): unknown {
  if (!error || typeof error !== "object" || !(key in error)) {
    return undefined;
  }

  return Reflect.get(error, key);
}

export function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
      status: readErrorProperty(error, "status"),
      statusCode: readErrorProperty(error, "statusCode"),
      code: readErrorProperty(error, "code"),
      details: readErrorProperty(error, "details"),
      hint: readErrorProperty(error, "hint"),
      error: readErrorProperty(error, "error"),
    };
  }

  if (error && typeof error === "object") {
    return {
      message: readErrorProperty(error, "message"),
      status: readErrorProperty(error, "status"),
      statusCode: readErrorProperty(error, "statusCode"),
      code: readErrorProperty(error, "code"),
      details: readErrorProperty(error, "details"),
      hint: readErrorProperty(error, "hint"),
      error: readErrorProperty(error, "error"),
    };
  }

  return { error };
}

function isMissingStorageObjectError(error: unknown): boolean {
  const statusCode = readErrorProperty(error, "statusCode");
  const errorCode = readErrorProperty(error, "error");
  const message = readErrorProperty(error, "message");

  return (
    statusCode === 404 ||
    errorCode === "STORAGE_NOT_FOUND" ||
    message === "Object not found"
  );
}

export async function replaceUserResume({
  file,
  extension,
  insforge,
  logPrefix,
  userId,
}: {
  file: Blob;
  extension: string;
  insforge: InsforgeServer;
  logPrefix: string;
  userId: string;
}): Promise<ReplaceUserResumeResult> {
  const resumePath = getResumeStoragePath(userId, extension);

  await Promise.all(
    getUserResumeStoragePaths(userId).map((path) =>
      insforge.storage.from(RESUME_BUCKET).remove(path),
    ),
  );

  const { data: uploadedResume, error: uploadError } = await insforge.storage
    .from(RESUME_BUCKET)
    .upload(resumePath, file);

  if (uploadError || !uploadedResume?.url) {
    console.error(`${logPrefix} Resume upload failed`, describeError(uploadError));
    return {
      success: false,
      error: "We could not upload your resume. Please try again.",
    };
  }

  return {
    success: true,
    resumePdfUrl: uploadedResume.url,
  };
}

export async function removeUserResume({
  insforge,
  logPrefix,
  userId,
}: {
  insforge: InsforgeServer;
  logPrefix: string;
  userId: string;
}): Promise<RemoveUserResumeResult> {
  const results = await Promise.all(
    getUserResumeStoragePaths(userId).map((path) =>
      insforge.storage.from(RESUME_BUCKET).remove(path),
    ),
  );
  const failedRemoval = results.find(
    (result) => result.error && !isMissingStorageObjectError(result.error),
  );

  if (failedRemoval?.error) {
    console.error(
      `${logPrefix} Resume removal failed`,
      describeError(failedRemoval.error),
    );
    return {
      success: false,
      error: "We could not remove your resume. Please try again.",
    };
  }

  return { success: true };
}
