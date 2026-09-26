"use client";
import { HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { listCountries, statesForCode } from "@/lib/countries";
import { listTimeZones } from "@/lib/timezone";
export function FieldLabel({
  label,
  required,
  help,
}: {
  label: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="label flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
      {help && (
        <span title={help} className="inline-flex cursor-help">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </span>
      )}
    </label>
  );
}

export function FieldErrorMsg({ err }: { err?: string[] }) {
  if (!err || err.length === 0) return null;
  return <p className="text-xs text-red-600 mt-1">{err[0]}</p>;
}

export function CountryField({
  code,
  onCodeChange,
  err,
}: {
  code: string;
  onCodeChange: (code: string) => void;
  err?: string[];
}) {
  const countries = useMemo(() => listCountries(), []);
  return (
    <div>
      <FieldLabel label="Country" required />
      <select className="input" value={code} onChange={(e) => onCodeChange(e.target.value)}>
        <option value="">-- Select Country --</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <FieldErrorMsg err={err} />
    </div>
  );
}

export function StateField({
  countryCode,
  value,
  onChange,
  err,
}: {
  countryCode: string;
  value: string;
  onChange: (v: string) => void;
  err?: string[];
}) {
  const options = useMemo(() => statesForCode(countryCode), [countryCode]);
  return (
    <div>
      <FieldLabel label="State/Province" required />
      {options === null ? (
        <input
          className="input"
          placeholder="State / Province"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : options.length === 0 ? (
        <input
          className="input bg-slate-50 text-slate-500"
          disabled
          value="No states for this country"
        />
      ) : (
        <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">-- Select State/Province --</option>
          {options.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      )}
      <FieldErrorMsg err={err} />
    </div>
  );
}

export function TimeZoneField({
  value,
  onChange,
  err,
}: {
  value: string;
  onChange: (v: string) => void;
  err?: string[];
}) {
  const options = useMemo(() => {
    const set = new Set(listTimeZones());
    if (value) set.add(value);
    return Array.from(set).sort();
  }, [value]);
  return (
    <div>
      <FieldLabel label="Time Zone" required />
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Select Time Zone --</option>
        {options.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
      <FieldErrorMsg err={err} />
    </div>
  );
}
