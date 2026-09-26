import { ApiError, errorMessage, isRecord, fieldErrors } from "./errors";

/** Only unwrap our envelope, never an ordinary domain object's status field. */
export function unwrapResponse(body: unknown, httpStatus = 200): unknown {
  if (httpStatus >= 400) {
    const fields = fieldErrors(body);
    throw new ApiError(
      errorMessage(body, fields ? Object.values(fields).flat()[0] : "Request failed."),
      httpStatus,
      fields,
    );
  }
  if (isRecord(body) && (body.status === "Failure" || body.status === "Error")) {
    const status =
      typeof body.statusCode === "number" && body.statusCode >= 400 && body.statusCode <= 599
        ? body.statusCode
        : 400;
    throw new ApiError(errorMessage(body, "Request failed."), status);
  }
  if (isRecord(body) && body.status === "Success") {
    if (!("result" in body)) throw new ApiError("The server returned an invalid response.", 502);
    return body.result;
  }
  return body;
}
