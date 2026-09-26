"use client";

import { useParams, notFound } from "next/navigation";
import { useState } from "react";

import {
  patients,
  patientExtras,
  generateSessions,
  devices,
  careMonitors,
  alerts,
  noteTypes,
  searchMonitorDirectory,
} from "@/lib/mock-data";

import { Modal } from "./model";

export function useProviderPatientDetailModel() {
  const params = useParams();
  const id = String(params.id);
  const p = patients.find((x) => x.id === id);
  if (!p) notFound();
  const ex = patientExtras[p.id];
  const pending = ex?.consent === "pending";
  const sessions = generateSessions(90);
  const device = devices.find((d) => d.assignedPatientId === p.id);
  const unassigned = devices.filter((d) => !d.assignedPatientId && d.status === "active");
  const patientAlerts = alerts.filter((a) => a.patientId === p.id);
  const [modal, setModal] = useState<Modal>(null);
  const [showWindow, setShowWindow] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState(noteTypes[0]);
  const [followUp, setFollowUp] = useState("");
  const [monitorQuery, setMonitorQuery] = useState("");
  const [grantAccess, setGrantAccess] = useState<"read-only" | "read-write">("read-only");
  const monitorResults = searchMonitorDirectory(monitorQuery);
  const cm = (cid?: string) => careMonitors.find((c) => c.id === cid);
  return {
    id,
    p,
    ex,
    pending,
    sessions,
    device,
    unassigned,
    patientAlerts,
    modal,
    setModal,
    showWindow,
    setShowWindow,
    noteText,
    setNoteText,
    noteType,
    setNoteType,
    followUp,
    setFollowUp,
    monitorQuery,
    setMonitorQuery,
    grantAccess,
    setGrantAccess,
    monitorResults,
    cm,
  };
}
