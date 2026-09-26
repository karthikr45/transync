"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { LIST_FIELDS, SECTION_TITLES, type MetadataSection } from "./model";
import type { MetadataDocument } from "./schemas";
import { useMetadataEditor } from "./hooks";

export default function MetadataEditor({
  original,
  section,
  onCancel,
  onSaved,
}: {
  original: MetadataDocument | null;
  section?: MetadataSection;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const m = useMetadataEditor(original, section, onSaved);
  const show = (key: MetadataSection) => !section || section === key;
  const title = original
    ? section
      ? `Edit ${SECTION_TITLES[section]}`
      : "Update metadata"
    : "Create metadata";
  const invalid = (field: string) => ({
    "aria-invalid": m.invalidField === field || undefined,
    "aria-describedby": m.invalidField === field ? "metadata-form-error" : undefined,
  });
  return (
    <section className="card p-4 md:p-6" aria-labelledby="metadata-editor-title">
      <h2
        ref={m.headingRef}
        tabIndex={-1}
        id="metadata-editor-title"
        className="text-lg font-semibold"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Changes affect patient signup options and app settings. Existing option values are
        preserved.
      </p>
      <form onSubmit={m.submit} className="mt-6 space-y-6" aria-busy={m.saving}>
        {m.error && (
          <p id="metadata-form-error" role="alert" className="text-sm text-red-700">
            {m.error}
          </p>
        )}
        <fieldset disabled={m.saving || m.uncertain} className="space-y-6">
          <legend className="sr-only">Metadata settings</legend>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {LIST_FIELDS.filter(({ key }) => show(key)).map(({ key, title: listTitle }) => (
              <fieldset
                key={key}
                className="space-y-3"
                aria-describedby={m.invalidField === key ? "metadata-form-error" : undefined}
              >
                <legend className="mb-2 font-semibold">{listTitle}</legend>
                {!m.form.lists[key].length && (
                  <p className="text-sm text-slate-500">
                    No options. Add at least one before saving.
                  </p>
                )}
                {m.form.lists[key].map((row, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="label">
                        {listTitle} option {index + 1}
                      </span>
                      <Input
                        value={row.label}
                        required
                        {...invalid(key)}
                        onChange={(event) => m.listLabel(key, index, event.target.value)}
                      />
                    </label>
                    <Button
                      variant="secondary"
                      aria-label={`Remove ${listTitle} option ${index + 1}`}
                      onClick={() => m.removeOption(key, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button onClick={() => m.addOption(key)}>
                  Add {listTitle.toLowerCase()} option
                </Button>
              </fieldset>
            ))}
          </div>
          {show("clinicalMode") && (
            <fieldset className="space-y-3">
              <legend className="mb-2 font-semibold">Clinical mode</legend>
              <label className="flex items-center gap-2 text-sm">
                <Input
                  type="checkbox"
                  checked={m.form.clinicalOn}
                  onChange={(event) => m.field("clinicalOn", event.target.checked)}
                />
                Clinical mode enabled
              </label>
              <label className="block">
                <span className="label">Delay (milliseconds)</span>
                <Input
                  inputMode="numeric"
                  value={m.form.delayTime}
                  required
                  {...invalid("delayTime")}
                  onChange={(event) => m.field("delayTime", event.target.value)}
                />
              </label>
            </fieldset>
          )}
          {show("appUpdate") && (
            <fieldset className="space-y-3">
              <legend className="mb-2 font-semibold">App update</legend>
              <label className="block">
                <span className="label">Latest app version</span>
                <Input
                  value={m.form.appUpdate.latestVersion}
                  {...invalid("latestVersion")}
                  onChange={(event) =>
                    m.field("appUpdate", { ...m.form.appUpdate, latestVersion: event.target.value })
                  }
                />
              </label>
              {(
                [
                  { key: "normalUpdate", label: "Suggest update" },
                  { key: "forceUpdate", label: "Force update" },
                  { key: "rm", label: "RM flag" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Input
                    type="checkbox"
                    checked={m.form.appUpdate[key]}
                    onChange={(event) =>
                      m.field("appUpdate", { ...m.form.appUpdate, [key]: event.target.checked })
                    }
                  />
                  {label}
                </label>
              ))}
              <label className="block">
                <span className="label">Update message</span>
                <Textarea
                  rows={3}
                  value={m.form.appUpdate.updateMessage}
                  onChange={(event) =>
                    m.field("appUpdate", { ...m.form.appUpdate, updateMessage: event.target.value })
                  }
                />
              </label>
            </fieldset>
          )}
          {show("other") && (
            <fieldset className="space-y-3">
              <legend className="mb-2 font-semibold">Other settings</legend>
              <label className="block">
                <span className="label">Google Play Store link</span>
                <Input
                  type="url"
                  value={m.form.playStoreUrl}
                  {...invalid("playStoreUrl")}
                  onChange={(event) => m.field("playStoreUrl", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Apple App Store link</span>
                <Input
                  type="url"
                  value={m.form.appStoreUrl}
                  {...invalid("appStoreUrl")}
                  onChange={(event) => m.field("appStoreUrl", event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Input
                  type="checkbox"
                  checked={m.form.showPopUp}
                  onChange={(event) => m.field("showPopUp", event.target.checked)}
                />
                Show pop-up in app
              </label>
            </fieldset>
          )}
        </fieldset>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onCancel} disabled={m.saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={m.saving || m.uncertain}>
            {m.saving ? "Saving…" : original ? "Save changes" : "Create metadata"}
          </Button>
        </div>
      </form>
    </section>
  );
}
