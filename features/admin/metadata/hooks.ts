"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { metadataApi } from "./api";
import { ApiError } from "@/lib/http/errors";
import {
  buildPayload,
  initialForm,
  MetadataValidationError,
  type MetadataForm,
  type MetadataSection,
  type ListKey,
} from "./model";
import type { MetadataDocument } from "./schemas";
export function useMetadata() {
  const [data, setData] = useState<MetadataDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [edit, setEdit] = useState<{
    original: MetadataDocument | null;
    section?: MetadataSection;
  } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteUncertain, setDeleteUncertain] = useState(false);
  const request = useRef<AbortController | null>(null);
  const deletingRef = useRef(false);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await metadataApi.read(controller.signal);
      if (!controller.signal.aborted) setData(result);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Could not load metadata.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    return () => request.current?.abort();
  }, [load]);
  function openEditor(section?: MetadataSection) {
    setNotice(null);
    setEdit({ original: data, section });
  }
  function cancelEdit() {
    setEdit(null);
  }
  async function saved() {
    setNotice(edit?.original ? "Metadata updated." : "Metadata created.");
    setEdit(null);
    await load();
  }
  function openDelete() {
    setNotice(null);
    setConfirmation("");
    setDeleteError(null);
    setDeleteUncertain(false);
    setDeleteOpen(true);
  }
  function cancelDelete() {
    if (!deletingRef.current) setDeleteOpen(false);
  }
  async function remove() {
    if (deletingRef.current || deleteUncertain || confirmation !== "DELETE" || !data?._id) return;
    deletingRef.current = true;
    setDeleting(true);
    setDeleteError(null);
    try {
      await metadataApi.remove(data);
      setDeleteOpen(false);
      setNotice("Metadata deleted.");
      await load();
    } catch (e) {
      const uncertain = e instanceof ApiError && (e.statusCode === 0 || e.statusCode >= 500);
      setDeleteUncertain(uncertain);
      setDeleteError(
        uncertain
          ? "Deletion could not be confirmed. Cancel and refresh to check the current state before trying again."
          : e instanceof Error
            ? e.message
            : "Could not delete metadata.",
      );
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
  }
  return {
    data,
    loading,
    error,
    notice,
    load,
    edit,
    openEditor,
    cancelEdit,
    saved,
    deleteOpen,
    openDelete,
    cancelDelete,
    confirmation,
    setConfirmation,
    deleting,
    deleteError,
    deleteUncertain,
    remove,
  };
}
export function useMetadataEditor(
  original: MetadataDocument | null,
  section: MetadataSection | undefined,
  onSaved: () => Promise<void>,
) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const [form, setForm] = useState(() => initialForm(original));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const busy = useRef(false);
  function field<K extends keyof MetadataForm>(key: K, value: MetadataForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function listLabel(key: ListKey, index: number, label: string) {
    setForm((current) => ({
      ...current,
      lists: {
        ...current.lists,
        [key]: current.lists[key].map((row, i) => (i === index ? { ...row, label } : row)),
      },
    }));
  }
  function addOption(key: ListKey) {
    setForm((current) => ({
      ...current,
      lists: { ...current.lists, [key]: [...current.lists[key], { label: "", value: undefined }] },
    }));
  }
  function removeOption(key: ListKey, index: number) {
    setForm((current) => ({
      ...current,
      lists: { ...current.lists, [key]: current.lists[key].filter((_, i) => i !== index) },
    }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy.current || uncertain) return;
    setError(null);
    setInvalidField(null);
    let payload;
    try {
      payload = buildPayload(form, original, section);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review the form.");
      if (e instanceof MetadataValidationError) setInvalidField(e.field);
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await metadataApi.save(original, payload);
      await onSaved();
    } catch (e) {
      const unknownResult = e instanceof ApiError && (e.statusCode === 0 || e.statusCode >= 500);
      setUncertain(unknownResult);
      setError(
        unknownResult
          ? "Saving could not be confirmed. Cancel and refresh before trying again."
          : e instanceof Error
            ? e.message
            : "Could not save metadata.",
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return {
    headingRef,
    form,
    field,
    listLabel,
    addOption,
    removeOption,
    saving,
    error,
    invalidField,
    uncertain,
    submit,
  };
}
