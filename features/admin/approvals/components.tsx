export function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}

export function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-right text-slate-900">{value}</dd>
    </div>
  );
}
