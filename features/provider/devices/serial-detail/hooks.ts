"use client";

import { useParams, notFound } from "next/navigation";
import { useState } from "react";

import { devices, patients } from "@/lib/mock-data";

export function useDeviceDetailModel() {
  const params = useParams();
  const serial = String(params.serial);
  const d = devices.find((x) => x.serial === serial);
  if (!d) notFound();
  const assigned = patients.find((p) => p.id === d.assignedPatientId);
  const [confirmDeact, setConfirmDeact] = useState(false);
  return { serial, d, assigned, confirmDeact, setConfirmDeact };
}
