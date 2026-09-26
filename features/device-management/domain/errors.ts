import { ApiError } from "@/lib/http/errors";
export function workflowError(error: unknown): string {
  if (error instanceof ApiError && [404, 501].includes(error.statusCode)) {
    return "Device management is not available yet. Please contact Transcend support or try again later.";
  }
  if (error instanceof ApiError && error.statusCode === 403)
    return "You do not have permission to perform this action. Contact your organization administrator.";
  if (error instanceof ApiError && error.statusCode === 409)
    return "This device or request has changed. Refresh the list and verify its current status before trying again.";
  return error instanceof Error
    ? error.message
    : "Could not complete the request. Please try again.";
}
