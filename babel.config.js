module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
    // Strip all comments from transpiled output.
    // Fixes: Hermes can't parse webpack magic comments inside dynamic import()
    // that come from @supabase/supabase-js OpenTelemetry instrumentation code.
    comments: false,
  };
};
