/**
 * App config — keep env-ish values out of business logic.
 */
export const config = {
  port: Number(process.env.PORT) || 4013,
  nodeEnv: process.env.NODE_ENV || "development",
  heartbeatMs: Number(process.env.HEARTBEAT_MS) || 15000,
};
