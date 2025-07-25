// craco.config.js
const webpack = require('webpack'); // Need webpack for ProvidePlugin if used later

module.exports = {
    webpack: {
      configure: (config) => {
        // Ensure resolve and fallback exist
        config.resolve = config.resolve || {};
        config.resolve.fallback = config.resolve.fallback || {};

        // Add fallbacks
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false, // Disable fs as it's not needed in the browser
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'), // Add crypto fallback
          stream: require.resolve('stream-browserify'), // Add stream fallback (often needed with crypto)
          vm: require.resolve('vm-browserify') // Add vm fallback (might be needed by dependencies)
        };

        // Add ProvidePlugin for Buffer if needed (sql.js might require it indirectly)
        config.plugins = (config.plugins || []).concat([
          new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
          }),
        ]);

        // Ignore specific warnings from source-map-loader if they clutter the output
        config.ignoreWarnings = [
          ...(config.ignoreWarnings || []),
          /Failed to parse source map/, // Example: Ignore source map warnings
        ];

        // Ensure CSS files are processed correctly
        const cssRule = config.module.rules.find(rule => rule.test && rule.test.toString().includes('.css'));
        if (cssRule) {
          // Force CSS modules to be disabled for global CSS files
          cssRule.use = cssRule.use.map(loader => {
            if (loader.loader && loader.loader.includes('css-loader')) {
              return {
                ...loader,
                options: {
                  ...loader.options,
                  modules: false,
                  sourceMap: true
                }
              };
            }
            return loader;
          });
        }

        return config;
      },
    },
    // Disable cache to ensure fresh builds
    babel: {
      loaderOptions: {
        cacheDirectory: false,
      },
    },
  };
