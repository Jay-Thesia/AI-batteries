/**
 * App config — keep env-ish values out of business logic.
 */
export const config = {
  port: Number(process.env.PORT) || 4011,
  nodeEnv: process.env.NODE_ENV || "development",
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS) || 2000,
};
