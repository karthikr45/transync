import { z } from "zod";
const identifier = z.union([z.string(), z.number().finite()]);
export const metadataOptionSchema = z.union([
  z.string().min(1),
  z
    .object({
      label: z.string().optional(),
      name: z.string().optional(),
      value: identifier.optional(),
      code: identifier.optional(),
      id: identifier.optional(),
    })
    .passthrough()
    .refine(
      (value) =>
        [value.label, value.name, value.value, value.code, value.id].some(
          (v) => v !== undefined && String(v).trim().length > 0,
        ),
      "Option has no label or value",
    ),
]);
export const metadataDocumentSchema = z
  .object({
    _id: z.string().min(1).optional(),
    occupation: z.array(metadataOptionSchema).optional(),
    userExpList: z.array(metadataOptionSchema).optional(),
    devicePurposeList: z.array(metadataOptionSchema).optional(),
    devicePurchaseList: z.array(metadataOptionSchema).optional(),
    transcendDevice: z.array(metadataOptionSchema).optional(),
    gender: z.array(metadataOptionSchema).optional(),
    timeZones: z.array(metadataOptionSchema).optional(),
    clinicalMode: z
      .object({ delayTime: z.string().optional(), disable: z.boolean().optional() })
      .passthrough()
      .optional(),
    appUpdate: z
      .object({
        normalUpdate: z.boolean().optional(),
        forceUpdate: z.boolean().optional(),
        latestVersion: z.string().optional(),
        updateMessage: z.string().optional(),
        rm: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    verbiage: z.record(z.string(), z.unknown()).optional(),
    playStoreUrl: z.string().optional(),
    appStoreUrl: z.string().optional(),
    showPopUp: z.boolean().optional(),
  })
  .passthrough();
export type MetadataDocument = z.infer<typeof metadataDocumentSchema>;
export type MetadataOption = z.infer<typeof metadataOptionSchema>;
export function parseMetadata(value: unknown): MetadataDocument | null {
  if (value === null) return null;
  const parsed = metadataDocumentSchema.safeParse(value);
  if (!parsed.success)
    throw new Error("The server returned invalid metadata. Editing is disabled; contact support.");
  return Object.keys(parsed.data).length ? parsed.data : null;
}
