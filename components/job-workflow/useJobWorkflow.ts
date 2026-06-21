"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  JobWorkflowCompareSession,
  JobWorkflowSnapshot,
  JobWorkflowState,
  JobWorkflowStatus,
} from "@/components/job-workflow/types";

const storageKey = "jobbiton-job-workflow-v1";
const compareHistoryLimit = 8;

const emptyWorkflowState: JobWorkflowState = {
  favorites: {},
  dismissed: {},
  statuses: {},
  notes: {},
  compare: {},
  activeCompareScopeKey: null,
  activeCompareScopeLabel: null,
  compareHistory: [],
};

export function useJobWorkflow() {
  const [state, setState] = useState<JobWorkflowState>(emptyWorkflowState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setState(readStoredState());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [isLoaded, state]);

  const compareJobs = useMemo(
    () =>
      Object.values(state.compare)
        .filter((job) => Boolean(job.id))
        .slice(0, 4),
    [state.compare],
  );

  const activateCompareScope = useCallback(
    ({
      scopeKey,
      label,
      visibleJobIds,
    }: {
      scopeKey: string;
      label: string;
      visibleJobIds: string[];
    }) => {
      setState((current) => {
        if (current.activeCompareScopeKey === scopeKey) {
          return current;
        }

        const visibleJobIdSet = new Set(visibleJobIds);
        const comparedJobs = Object.values(current.compare).filter((job) =>
          Boolean(job.id),
        );
        const shouldKeepMigratedCompare =
          current.activeCompareScopeKey === null &&
          comparedJobs.length > 0 &&
          comparedJobs.every((job) => visibleJobIdSet.has(job.id));
        const nextHistory = shouldKeepMigratedCompare
          ? current.compareHistory
          : addCompareHistory(
              current.compareHistory,
              createCompareSession({
                scopeKey: current.activeCompareScopeKey ?? "legacy",
                label:
                  current.activeCompareScopeLabel ??
                  (current.activeCompareScopeKey === null
                    ? "Previous comparison"
                    : "Previous search"),
                jobs: comparedJobs,
              }),
            );

        return {
          ...current,
          compare: shouldKeepMigratedCompare ? current.compare : {},
          activeCompareScopeKey: scopeKey,
          activeCompareScopeLabel: label,
          compareHistory: nextHistory,
        };
      });
    },
    [],
  );

  const setStatus = useCallback(
    (jobId: string, status: JobWorkflowStatus) => {
      setState((current) => ({
        ...current,
        statuses: {
          ...current.statuses,
          [jobId]: status,
        },
      }));
    },
    [],
  );

  const setNote = useCallback((jobId: string, note: string) => {
    setState((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [jobId]: note,
      },
    }));
  }, []);

  const toggleFavorite = useCallback((jobId: string) => {
    setState((current) => {
      const nextFavorites = { ...current.favorites };

      if (nextFavorites[jobId]) {
        delete nextFavorites[jobId];
      } else {
        nextFavorites[jobId] = true;
      }

      return {
        ...current,
        favorites: nextFavorites,
      };
    });
  }, []);

  const toggleDismissed = useCallback((jobId: string) => {
    setState((current) => {
      const nextDismissed = { ...current.dismissed };

      if (nextDismissed[jobId]) {
        delete nextDismissed[jobId];
      } else {
        nextDismissed[jobId] = true;
      }

      return {
        ...current,
        dismissed: nextDismissed,
      };
    });
  }, []);

  const toggleCompare = useCallback((job: JobWorkflowSnapshot) => {
    setState((current) => {
      const nextCompare = { ...current.compare };

      if (nextCompare[job.id]) {
        delete nextCompare[job.id];
      } else if (Object.keys(nextCompare).length < 4) {
        nextCompare[job.id] = job;
      }

      return {
        ...current,
        compare: nextCompare,
      };
    });
  }, []);

  const removeCompare = useCallback((jobId: string) => {
    setState((current) => {
      const nextCompare = { ...current.compare };
      delete nextCompare[jobId];

      return {
        ...current,
        compare: nextCompare,
      };
    });
  }, []);

  const clearCompare = useCallback(() => {
    setState((current) => ({
      ...current,
      compare: {},
    }));
  }, []);

  const restoreCompareSession = useCallback((sessionId: string) => {
    setState((current) => {
      const session = current.compareHistory.find((item) => item.id === sessionId);

      if (!session) {
        return current;
      }

      return {
        ...current,
        compare: Object.fromEntries(session.jobs.slice(0, 4).map((job) => [job.id, job])),
      };
    });
  }, []);

  const removeCompareSession = useCallback((sessionId: string) => {
    setState((current) => ({
      ...current,
      compareHistory: current.compareHistory.filter((session) => session.id !== sessionId),
    }));
  }, []);

  return {
    state,
    isLoaded,
    compareJobs,
    activateCompareScope,
    setStatus,
    setNote,
    toggleFavorite,
    toggleDismissed,
    toggleCompare,
    removeCompare,
    clearCompare,
    restoreCompareSession,
    removeCompareSession,
  };
}

function readStoredState(): JobWorkflowState {
  try {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return emptyWorkflowState;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!isRecord(parsed)) {
      return emptyWorkflowState;
    }

    return {
      favorites: readTrueRecord(parsed.favorites),
      dismissed: readTrueRecord(parsed.dismissed),
      statuses: readStatusRecord(parsed.statuses),
      notes: readStringRecord(parsed.notes),
      compare: readCompareRecord(parsed.compare),
      activeCompareScopeKey: readNullableString(parsed.activeCompareScopeKey),
      activeCompareScopeLabel: readNullableString(parsed.activeCompareScopeLabel),
      compareHistory: readCompareHistory(parsed.compareHistory),
    };
  } catch {
    return emptyWorkflowState;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readTrueRecord(value: unknown): Record<string, true> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item === true)
      .map(([key]) => [key, true]),
  );
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readStatusRecord(value: unknown): Record<string, JobWorkflowStatus> {
  if (!isRecord(value)) {
    return {};
  }

  const allowed = new Set<JobWorkflowStatus>([
    "interested",
    "applied",
    "interviewing",
    "offer",
    "rejected",
    "archived",
  ]);

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, JobWorkflowStatus] =>
        typeof entry[1] === "string" &&
        allowed.has(entry[1] as JobWorkflowStatus),
    ),
  );
}

function readCompareRecord(value: unknown): Record<string, JobWorkflowSnapshot> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, JobWorkflowSnapshot] =>
        isRecord(entry[1]) &&
        typeof entry[1].id === "string" &&
        typeof entry[1].title === "string" &&
        typeof entry[1].company === "string",
    ),
  );
}

function readCompareHistory(value: unknown): JobWorkflowCompareSession[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(readCompareSession)
    .filter((session): session is JobWorkflowCompareSession => Boolean(session))
    .slice(0, compareHistoryLimit);
}

function readCompareSession(value: unknown): JobWorkflowCompareSession | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readNullableString(value.id);
  const scopeKey = readNullableString(value.scopeKey);
  const label = readNullableString(value.label);
  const createdAt = readNullableString(value.createdAt);
  const jobs = readCompareList(value.jobs);

  if (!id || !scopeKey || !label || !createdAt || jobs.length < 2) {
    return null;
  }

  return {
    id,
    scopeKey,
    label,
    createdAt,
    jobs,
  };
}

function readCompareList(value: unknown): JobWorkflowSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is JobWorkflowSnapshot =>
        isRecord(item) &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.company === "string",
    )
    .slice(0, 4);
}

function createCompareSession({
  scopeKey,
  label,
  jobs,
}: {
  scopeKey: string;
  label: string;
  jobs: JobWorkflowSnapshot[];
}): JobWorkflowCompareSession | null {
  const sessionJobs = jobs.slice(0, 4);

  if (sessionJobs.length < 2) {
    return null;
  }

  const createdAt = new Date().toISOString();

  return {
    id: `${scopeKey}-${createdAt}`,
    scopeKey,
    label,
    createdAt,
    jobs: sessionJobs,
  };
}

function addCompareHistory(
  history: JobWorkflowCompareSession[],
  session: JobWorkflowCompareSession | null,
): JobWorkflowCompareSession[] {
  if (!session) {
    return history;
  }

  const nextJobKey = getCompareJobKey(session.jobs);

  return [
    session,
    ...history.filter((item) => getCompareJobKey(item.jobs) !== nextJobKey),
  ].slice(0, compareHistoryLimit);
}

function getCompareJobKey(jobs: JobWorkflowSnapshot[]): string {
  return jobs
    .map((job) => job.id)
    .sort()
    .join("|");
}
