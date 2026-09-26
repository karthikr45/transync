import { z } from "zod";

const optionalText = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);
export const permissionSchema = z.enum([
  "registry:write",
  "allocations:write",
  "claims:write",
  "claims:review",
  "transfers:write",
  "transfers:review",
  "assignments:write",
]);
export const contextSchema = z.object({
  contractVersion: z.literal(1),
  organizationId: z.string().nullable(),
  permissions: z.array(permissionSchema),
});
export const serialResultSchema = z.object({
  serial: z.string().min(1),
  outcome: z.enum([
    "eligible",
    "claimed",
    "already_added",
    "approval_required",
    "transfer_required",
    "invalid",
    "restricted",
    "registered",
    "already_registered",
    "allocated",
    "rejected",
  ]),
  message: z.string(),
});
export const claimCheckSchema = z.object({
  validationId: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
  results: z.array(serialResultSchema).min(1),
});
export const mutationResultSchema = z.object({
  message: z.string().min(1),
  results: z.array(serialResultSchema).optional(),
});
export const choiceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  detail: optionalText,
});
export const workflowRowSchema = z.object({
  id: z.string().min(1),
  serial: optionalText,
  serials: z.array(z.string()).optional(),
  model: optionalText,
  status: optionalText,
  organizationName: optionalText,
  sourceOrganizationName: optionalText,
  targetOrganizationName: optionalText,
  patientName: optionalText,
  reference: optionalText,
  reason: optionalText,
  reviewReason: optionalText,
  requestedAt: optionalText,
  updatedAt: optionalText,
  effectiveAt: optionalText,
  actorName: optionalText,
  action: optionalText,
  previousStatus: optionalText,
  newStatus: optionalText,
  allowedActions: z
    .array(
      z.enum(["approve", "reject", "release", "accept", "assign", "return", "restrict", "retire"]),
    )
    .optional(),
});
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
  });
