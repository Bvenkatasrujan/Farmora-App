// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ─── Fix: @supabase uses dynamic import() with webpack/turbopack magic comments
// e.g. import(/* webpackIgnore: true */ OTEL_PKG)
// Hermes (hermesc) cannot parse inline comments inside import() — it exits with code 2.
//
// Solution: add @supabase to the list of packages that Metro passes through Babel.
// babel.config.js has `comments: false`, which strips ALL inline comments before
// hermesc ever sees them.
//
// All other native/expo packages that need Babel transformation are listed here too.
config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    'node_modules/(?!(' + [
      'react-native',
      '@react-native',
      '@react-native-community',
      'expo',
      '@expo',
      '@unimodules',
      // ← The critical one: strip webpack magic comments via babel
      '@supabase',
      'nativewind',
      'react-native-css-interop',
      'react-native-reanimated',
      'react-native-worklets',
      'react-native-gesture-handler',
      'react-native-screens',
      'react-native-safe-area-context',
      'react-native-svg',
      'react-native-calendars',
      'react-native-element-dropdown',
      '@react-navigation',
      'lucide-react-native',
      'zustand',
    ].join('|') + ')/)',
  ],
};

// ─── Shim @opentelemetry/api and redirect @supabase/supabase-js to CommonJS ────
// 1. Supabase tries to dynamically import @opentelemetry/api for telemetry. It doesn't exist
//    in React Native, so we redirect it to an empty stub.
// 2. Supabase uses dynamic import() in its ES module index.mjs, which Hermesc cannot parse.
//    We redirect @supabase/supabase-js to index.cjs which uses require() and builds successfully.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'shims/opentelemetry.js'),
    };
  }
  if (moduleName === '@supabase/supabase-js') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
