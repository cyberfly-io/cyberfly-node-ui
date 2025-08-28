module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": require.resolve("stream-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "buffer": require.resolve("buffer/"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "url": require.resolve("url/"),
    "path": require.resolve("path-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "querystring": require.resolve("querystring-es3"),
    "fs": false,
    "net": false,
    "tls": false,
    "child_process": false,
  };

  // Add buffer polyfill
  config.plugins = (config.plugins || []).concat([
    new (require('webpack')).ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);

  return config;
};
