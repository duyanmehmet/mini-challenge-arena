const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAbiFilters(config) {
  if (process.env.PREVIEW_BUILD !== '1') return config;
  return withAppBuildGradle(config, (cfg) => {
    try {
      if (cfg.modResults.contents.includes('abiFilters')) return cfg;
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /defaultConfig\s*\{/,
        'defaultConfig {\n            ndk {\n                abiFilters "arm64-v8a"\n            }'
      );
    } catch (e) {
      console.warn('[withAbiFilters] failed:', e);
    }
    return cfg;
  });
};
