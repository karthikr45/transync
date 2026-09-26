"use client";
import { useEffect, useState } from "react";
import { deviceWorkflowApi } from "../api/device-workflow-api";
import { workflowError } from "../domain/errors";
import type { Choice } from "../domain/types";
export function useChoices(kind: "organizations" | "patients", onChange: (id: string) => void) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      deviceWorkflowApi
        .choices(kind, search.trim(), controller.signal)
        .then((result) => {
          if (!Array.isArray(result.items))
            throw new Error("Could not read the available choices.");
          if (active) setItems(result.items);
        })
        .catch((e) => {
          if (active) {
            setItems([]);
            setError(workflowError(e));
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [kind, search]);
  return { search, setSearch, items, loading, error };
}
