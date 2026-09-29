import * as zod from "zod";
export * from "./generated/api.js";

// Manually adding the missing health check response schema
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});
