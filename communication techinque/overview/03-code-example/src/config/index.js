/**
 * App config — keep env-ish values out of business logic.
 */
export const config = {
  port: Number(process.env.PORT) || 4010,
  nodeEnv: process.env.NODE_ENV || "development",
  waitTimeoutMs: Number(process.env.WAIT_TIMEOUT_MS) || 20000,
  heartbeatMs: Number(process.env.HEARTBEAT_MS) || 15000,
};
