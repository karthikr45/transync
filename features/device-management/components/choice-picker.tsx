"use client";
import { useChoices } from "../hooks/use-choices";
export function ChoicePicker({
  kind,
  label,
  value,
  onChange,
}: {
  kind: "organizations" | "patients";
  label: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const { search, setSearch, items, loading, error } = useChoices(kind, onChange);
  return (
    <div className="space-y-2">
      <label className="block text-sm">
        Search {label.toLowerCase()}
        <input
          className="input mt-1"
          value={search}
          placeholder="Type a name to search…"
          onChange={(e) => {
            setSearch(e.target.value);
            onChange("");
          }}
        />
      </label>
      <label className="block text-sm">
        {label}
        <select
          aria-label={label}
          className="input mt-1"
          required
          value={value}
          disabled={loading || !!error}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{loading ? "Loading…" : "Select one"}</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.detail ? ` — ${item.detail}` : ""}
            </option>
          ))}
        </select>
      </label>
      {!loading && !error && !items.length && (
        <p className="text-xs text-slate-500">No eligible matches. Try another name.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
