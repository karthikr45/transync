"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { devices } from "@/lib/mock-data";

export function useCreatePatientModel() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const unassigned = devices.filter((d) => !d.assignedPatientId && d.status === "active");
  return { done, setDone, unassigned };
}
