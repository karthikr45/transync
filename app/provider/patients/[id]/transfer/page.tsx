"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import MockBanner from "@/components/MockBanner";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { patients, subAccounts } from "@/lib/mock-data";

type Dest = { kind: "sub" | "provider"; label: string };

export default function TransferPatient() {
  const params = useParams();
  const p = patients.find((x) => x.id === String(params.id));
  if (!p) notFound();

  const [step, setStep] = useState(1);
  const [dest, setDest] = useState<Dest | null>(null);
  const [accepted, setAccepted] = useState(false);

  const permanent = dest?.kind === "provider";

  if (step === 3) {
    return (
      <>
        <PageHeader title="Transfer complete" />
      <MockBanner />
        <div className="card p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{p.name} transferred</h2>
          <p className="text-sm text-slate-600 mt-2">
            {permanent
              ? `Ownership moved to ${dest?.label}. This account no longer has access to this patient or their records.`
              : `${p.name} is now shared with ${dest?.label}. You keep full control of this patient.`}
          </p>
          <div className="mt-6">
            <Link href="/provider/patients" className="btn-primary">Back to patients</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Link href={`/provider/patients/${p.id}`} className="text-sm text-slate-500 inline-flex items-center gap-1 mb-3 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to patient
      </Link>
      <PageHeader title={`Transfer ${p.name}`} subtitle="Sub-account sharing keeps your control. Provider transfer is permanent." />

      <div className="max-w-2xl">
        {step === 1 && (
          <div className="card p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Choose destination</h2>
            {subAccounts.map((s) => (
              <DestRow
                key={s.id}
                selected={dest?.label === s.name}
                onClick={() => setDest({ kind: "sub", label: s.name })}
                title={s.name}
                tag="Sub-account"
                tagClass="badge-green"
                desc="You retain control of the patient and all records."
              />
            ))}
            {["Apria Healthcare", "Lincare", "AdaptHealth"].map((name) => (
              <DestRow
                key={name}
                selected={dest?.label === name}
                onClick={() => setDest({ kind: "provider", label: name })}
                title={name}
                tag="Other provider"
                tagClass="badge-red"
                desc="Permanent. You lose all rights and records for this patient."
              />
            ))}
            <div className="flex justify-end pt-2">
              <button className="btn-primary disabled:opacity-50" disabled={!dest} onClick={() => setStep(2)}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card p-5">
            <h2 className="text-base font-semibold text-slate-900">Confirm transfer</h2>
            <p className="text-sm text-slate-600 mt-1">
              Destination: <strong>{dest?.label}</strong>
            </p>
            {permanent && (
              <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="text-sm text-red-800">
                  This is a <strong>permanent</strong> transfer to another homecare provider. Once confirmed, this
                  account immediately loses all access to {p.name} and their compliance history. This cannot be undone.
                </div>
              </div>
            )}
            <label className="flex gap-2 items-start mt-4 text-sm text-slate-700">
              <input type="checkbox" className="mt-0.5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              I accept the Terms of Use for patient transfer{permanent ? " and understand this is irreversible." : "."}
            </label>
            <div className="mt-5 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button
                className={permanent ? "btn-danger disabled:opacity-50" : "btn-primary disabled:opacity-50"}
                disabled={!accepted}
                onClick={() => setStep(3)}
              >
                {permanent ? "Permanently transfer" : "Share to sub-account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DestRow({
  selected, onClick, title, tag, tagClass, desc,
}: {
  selected: boolean; onClick: () => void; title: string; tag: string; tagClass: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border p-4 transition flex items-start gap-3 ${
        selected ? "border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/30" : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${selected ? "border-brand-600 bg-brand-600" : "border-slate-300"}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{title}</span>
          <span className={`badge ${tagClass}`}>{tag}</span>
        </div>
        <p className="text-sm text-slate-600 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
