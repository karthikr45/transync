import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  LIST_FIELDS,
  SECTION_TITLES,
  humanise,
  safeLink,
  displayOption,
  type MetadataSection,
} from "./model";
import type { MetadataDocument } from "./schemas";

function Value({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === "")
    return <span className="text-slate-500">Not set</span>;
  if (typeof value === "boolean") return <span>{value ? "Enabled" : "Disabled"}</span>;
  const link = safeLink(value);
  if (link)
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-600 underline break-all"
      >
        {link}
      </a>
    );
  return (
    <span className="whitespace-pre-wrap break-words">
      {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
    </span>
  );
}
export function MetadataDetails({
  data,
  editable,
  onEdit,
}: {
  data: MetadataDocument;
  editable: boolean;
  onEdit: (section: MetadataSection) => void;
}) {
  const listKeys = [
    ...new Set([
      ...LIST_FIELDS.map((f) => f.key),
      ...Object.keys(data).filter((key) => !key.startsWith("_") && Array.isArray(data[key])),
    ]),
  ];
  const hidden = new Set([
    "_id",
    "__v",
    "createdAt",
    "updatedAt",
    "clinicalMode",
    "appUpdate",
    ...listKeys,
  ]);
  return (
    <div className="space-y-6">
      <section aria-label="Signup options" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {listKeys.map((key) => {
          const field = LIST_FIELDS.find((f) => f.key === key);
          const rows = Array.isArray(data[key]) ? (data[key] as unknown[]) : [];
          return (
            <section key={key} className="card p-5" aria-label={field?.title ?? humanise(key)}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold">{field?.title ?? humanise(key)}</h2>
                {field && editable && (
                  <Button onClick={() => onEdit(field.key)}>Edit {field.title}</Button>
                )}
              </div>
              {!rows.length ? (
                <p className="text-sm text-slate-500">No options returned.</p>
              ) : (
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {rows.map((row, index) => {
                    return <li key={index}>{displayOption(row)}</li>;
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="card p-5" aria-label="Clinical mode">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Clinical mode</h2>
            {editable && <Button onClick={() => onEdit("clinicalMode")}>Edit clinical mode</Button>}
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Clinical mode enabled</dt>
              <dd>
                <Value
                  value={
                    data.clinicalMode?.disable === undefined
                      ? undefined
                      : !data.clinicalMode.disable
                  }
                />
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Delay (milliseconds)</dt>
              <dd>
                <Value value={data.clinicalMode?.delayTime} />
              </dd>
            </div>
          </dl>
        </section>
        <section className="card p-5" aria-label="App update">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">App update</h2>
            {editable && <Button onClick={() => onEdit("appUpdate")}>Edit app update</Button>}
          </div>
          <dl className="space-y-3 text-sm">
            {Object.entries(data.appUpdate ?? {}).map(([key, value]) => (
              <div key={key}>
                <dt className="text-slate-500">{humanise(key)}</dt>
                <dd>
                  <Value value={value} />
                </dd>
              </div>
            ))}
          </dl>
          {!data.appUpdate && <p className="text-sm text-slate-500">Not set</p>}
        </section>
      </div>
      <section className="card p-5" aria-label="Other settings">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold">{SECTION_TITLES.other}</h2>
          {editable && <Button onClick={() => onEdit("other")}>Edit other settings</Button>}
        </div>
        <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          {Object.entries(data)
            .filter(([key]) => !key.startsWith("_") && !hidden.has(key))
            .map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="text-slate-500">{humanise(key)}</dt>
                <dd>
                  <Value value={value} />
                </dd>
              </div>
            ))}
        </dl>
      </section>
    </div>
  );
}
export function DeleteConfirmation({
  confirmation,
  onConfirmation,
  deleting,
  error,
  uncertain,
  onCancel,
  onDelete,
}: {
  confirmation: string;
  onConfirmation: (value: string) => void;
  deleting: boolean;
  error: string | null;
  uncertain: boolean;
  onCancel: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <section
      className="card p-5 space-y-4"
      aria-labelledby="delete-metadata-title"
      aria-busy={deleting}
    >
      <h2 id="delete-metadata-title" className="font-semibold">
        Delete metadata
      </h2>
      <p className="text-sm">
        This removes the metadata record used for signup options and app settings. It can affect
        patient applications. To proceed, type DELETE.
      </p>
      <label className="block">
        <span className="label">Delete confirmation</span>
        <Input
          autoComplete="off"
          value={confirmation}
          disabled={deleting || uncertain}
          onChange={(event) => onConfirmation(event.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button disabled={deleting} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={deleting || uncertain || confirmation !== "DELETE"}
          onClick={() => void onDelete()}
        >
          {deleting ? "Deleting…" : "Delete metadata permanently"}
        </Button>
      </div>
    </section>
  );
}
