"use client";

import { useParams, notFound } from "next/navigation";
import { useState } from "react";

import { patients } from "@/lib/mock-data";
import { Dest } from "./model";

export function useTransferPatientModel() {
  const params = useParams();
  const p = patients.find((x) => x.id === String(params.id));
  if (!p) notFound();
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState<Dest | null>(null);
  const [accepted, setAccepted] = useState(false);
  const permanent = dest?.kind === "provider";
  return { p, step, setStep, dest, setDest, accepted, setAccepted, permanent };
}
