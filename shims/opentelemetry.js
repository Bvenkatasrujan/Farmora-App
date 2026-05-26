// Empty shim for @opentelemetry/api
// Supabase tries to dynamically import this for telemetry instrumentation.
// It's not needed in React Native — this shim prevents runtime errors.
module.exports = {};
