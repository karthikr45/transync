// Compatibility facade. New features import their own API service.
export { homeCareApi } from "@/features/home-care/api";
export { endUserApi } from "@/features/end-user/api";
export { apiFetch } from "./http/client";
export { ApiError } from "./http/errors";
