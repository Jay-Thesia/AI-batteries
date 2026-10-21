/**
 * App config — keep env-ish values out of business logic.
 */
export const config = {
  port: Number(process.env.PORT) || 4021,
  nodeEnv: process.env.NODE_ENV || "development",
};
