import { metadataOptionSchema, type MetadataDocument, type MetadataOption } from "./schemas";

export const LIST_FIELDS = [
  { key: "occupation", title: "Occupation" },
  { key: "userExpList", title: "CPAP experience" },
  { key: "devicePurposeList", title: "Device usage" },
  { key: "devicePurchaseList", title: "Purchase source" },
] as const;
export type ListKey = (typeof LIST_FIELDS)[number]["key"];
export type MetadataSection = ListKey | "clinicalMode" | "appUpdate" | "other";
export type OptionDraft = {
  label: string;
  value: string | number | undefined;
  original?: MetadataOption;
};
export type MetadataForm = {
  lists: Record<ListKey, OptionDraft[]>;
  clinicalOn: boolean;
  delayTime: string;
  appUpdate: {
    normalUpdate: boolean;
    forceUpdate: boolean;
    latestVersion: string;
    updateMessage: string;
    rm: boolean;
  };
  playStoreUrl: string;
  appStoreUrl: string;
  showPopUp: boolean;
};
export type MetadataPayload = Record<string, unknown>;
export const SECTION_TITLES: Record<MetadataSection, string> = {
  occupation: "Occupation",
  userExpList: "CPAP experience",
  devicePurposeList: "Device usage",
  devicePurchaseList: "Purchase source",
  clinicalMode: "Clinical mode",
  appUpdate: "App update",
  other: "Other settings",
};
export function optionLabel(option: MetadataOption): string {
  if (typeof option === "string") return option;
  return option.label ?? option.name ?? String(option.value ?? option.code ?? option.id ?? "");
}
export function optionValue(option: MetadataOption): string | number | undefined {
  return typeof option === "string" ? undefined : (option.value ?? option.code ?? option.id);
}
export function initialForm(data: MetadataDocument | null): MetadataForm {
  return {
    lists: Object.fromEntries(
      LIST_FIELDS.map(({ key }) => [
        key,
        data?.[key]?.length
          ? data[key].map((option) => ({
              label: optionLabel(option),
              value: optionValue(option),
              original: option,
            }))
          : [{ label: "", value: undefined }],
      ]),
    ) as MetadataForm["lists"],
    clinicalOn: data?.clinicalMode ? data.clinicalMode.disable === false : false,
    delayTime: data?.clinicalMode?.delayTime ?? "5000",
    appUpdate: {
      normalUpdate: data?.appUpdate?.normalUpdate ?? false,
      forceUpdate: data?.appUpdate?.forceUpdate ?? false,
      latestVersion: data?.appUpdate?.latestVersion ?? "",
      updateMessage: data?.appUpdate?.updateMessage ?? "",
      rm: data?.appUpdate?.rm ?? false,
    },
    playStoreUrl: data?.playStoreUrl ?? "",
    appStoreUrl: data?.appStoreUrl ?? "",
    showPopUp: data?.showPopUp ?? false,
  };
}
export class MetadataValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message);
    this.name = "MetadataValidationError";
  }
}
function validateStoreUrl(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error();
  } catch {
    throw new MetadataValidationError(
      "Store links must use HTTPS without embedded credentials.",
      field,
    );
  }
  return trimmed;
}
function serializeList(
  rows: OptionDraft[],
  key: ListKey,
  original: MetadataDocument | null,
): MetadataOption[] {
  if (!rows.length || rows.some((row) => !row.label.trim()))
    throw new MetadataValidationError(
      `Every ${SECTION_TITLES[key].toLowerCase()} option needs a label. Remove unused rows.`,
      key,
    );
  const labels = rows.map((row) => row.label.trim().toLocaleLowerCase());
  if (new Set(labels).size !== labels.length)
    throw new MetadataValidationError("Option labels must be unique within a list.", key);
  const ids = rows.flatMap((row) => (row.value === undefined ? [] : [String(row.value)]));
  if (new Set(ids).size !== ids.length)
    throw new MetadataValidationError(
      "The server returned duplicate option values. Resolve the metadata before saving.",
      key,
    );
  // Never reuse a removed value in the same edit or renumber existing values.
  const reserved = new Set(
    (original?.[key] ?? [])
      .map(optionValue)
      .filter((v) => v !== undefined)
      .map(String),
  );
  for (const id of ids) reserved.add(id);
  let next = Math.max(-1, ...[...reserved].filter((v) => /^\d+$/.test(v)).map(Number)) + 1;
  return rows.map((row) => {
    const label = row.label.trim();
    if (typeof row.original === "string") return label;
    if (row.original && row.value === undefined)
      return {
        ...row.original,
        ...(row.original.label !== undefined ? { label } : { name: label }),
      };
    if (row.value !== undefined) {
      const base = typeof row.original === "object" ? row.original : {};
      if (base.value === undefined && (base.code !== undefined || base.id !== undefined))
        return { ...base, ...(base.label !== undefined ? { label } : { name: label }) };
      return { ...base, label, value: row.value };
    }
    while (reserved.has(String(next))) next++;
    if (!Number.isSafeInteger(next))
      throw new MetadataValidationError(
        "No safe numeric option value is available. Contact support.",
        key,
      );
    reserved.add(String(next));
    return { label, value: next++ };
  });
}
export function buildPayload(
  form: MetadataForm,
  original: MetadataDocument | null,
  section?: MetadataSection,
): MetadataPayload {
  const keys = [
    ...LIST_FIELDS.map((f) => f.key),
    "verbiage",
    "clinicalMode",
    "appUpdate",
    "playStoreUrl",
    "appStoreUrl",
    "showPopUp",
  ];
  const payload: MetadataPayload = original
    ? Object.fromEntries(
        keys.filter((key) => Object.hasOwn(original, key)).map((key) => [key, original[key]]),
      )
    : { verbiage: {} };
  const initial = initialForm(original);
  // Skip unedited fields, including missing optional fields. Never default an unrelated setting.
  const changed = (key: MetadataSection, current: unknown, previous: unknown) =>
    (!section || section === key) &&
    (!original || JSON.stringify(current) !== JSON.stringify(previous));
  for (const { key } of LIST_FIELDS)
    if (changed(key, form.lists[key], initial.lists[key]))
      payload[key] = serializeList(form.lists[key], key, original);
  if (
    changed(
      "clinicalMode",
      [form.clinicalOn, form.delayTime],
      [initial.clinicalOn, initial.delayTime],
    )
  ) {
    if (!/^\d+$/.test(form.delayTime.trim()) || !Number.isSafeInteger(Number(form.delayTime)))
      throw new MetadataValidationError(
        "Delay must be a non-negative whole number of milliseconds.",
        "delayTime",
      );
    payload.clinicalMode = {
      ...original?.clinicalMode,
      delayTime: form.delayTime.trim(),
      disable: !form.clinicalOn,
    };
  }
  if (changed("appUpdate", form.appUpdate, initial.appUpdate)) {
    if (
      (form.appUpdate.normalUpdate || form.appUpdate.forceUpdate) &&
      !form.appUpdate.latestVersion.trim()
    )
      throw new MetadataValidationError(
        "Enter the latest version before enabling an update prompt.",
        "latestVersion",
      );
    payload.appUpdate = {
      ...original?.appUpdate,
      ...form.appUpdate,
      latestVersion: form.appUpdate.latestVersion.trim(),
    };
  }
  if (changed("other", form.playStoreUrl, initial.playStoreUrl))
    payload.playStoreUrl = validateStoreUrl(form.playStoreUrl, "playStoreUrl");
  if (changed("other", form.appStoreUrl, initial.appStoreUrl))
    payload.appStoreUrl = validateStoreUrl(form.appStoreUrl, "appStoreUrl");
  if (changed("other", form.showPopUp, initial.showPopUp)) payload.showPopUp = form.showPopUp;
  return payload;
}
export function fingerprint(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(fingerprint).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => `${JSON.stringify(key)}:${fingerprint(v)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}
export function humanise(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}
export function isMetadataSection(key: string): key is MetadataSection {
  return Object.hasOwn(SECTION_TITLES, key);
}
export function safeLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : null;
  } catch {
    return null;
  }
}

export function displayOption(value: unknown): string {
  const parsed = metadataOptionSchema.safeParse(value);
  return parsed.success ? optionLabel(parsed.data) : (JSON.stringify(value) ?? "Not set");
}
