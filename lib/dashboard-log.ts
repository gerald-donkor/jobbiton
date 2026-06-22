export function warnDashboardDataIssue(
  scope: string,
  error: unknown,
): void {
  console.warn(scope, describeDashboardError(error));
}

function describeDashboardError(error: unknown): string {
  if (!error) {
    return "Unknown dashboard data error.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = readString(record.message) ?? readString(record.error);
    const code = readString(record.code) ?? readString(record.statusCode);

    if (message && code) {
      return `${message} (${code})`;
    }

    if (message) {
      return message;
    }

    if (code) {
      return `Dashboard data request failed (${code}).`;
    }
  }

  return "Dashboard data request failed.";
}

function readString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}
