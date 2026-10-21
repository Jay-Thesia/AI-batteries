/**
 * App config — keep env-ish values out of business logic.
 */
export const config = {
  port: Number(process.env.PORT) || 50051,
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};
