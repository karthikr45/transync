"use client";
import { useEffect, useState } from "react";
import { deviceWorkflowApi } from "../api/device-workflow-api";
import { workflowError } from "../domain/errors";
import type { WorkflowContext } from "../domain/types";
export function useWorkflowContext() {
  const [context, setContext] = useState<WorkflowContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setContext(null);
    setError(null);
    deviceWorkflowApi
      .context(controller.signal)
      .then((result) => {
        if (result.contractVersion !== 1 || !Array.isArray(result.permissions))
          throw new Error("Device management needs an update. Please contact Transcend support.");
        if (active) setContext(result);
      })
      .catch((e) => {
        if (active) setError(workflowError(e));
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);
  return { context, error, retry: () => setAttempt((n) => n + 1) };
}
