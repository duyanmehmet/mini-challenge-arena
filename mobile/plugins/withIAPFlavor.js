const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withIAPFlavor(config) {
  return withAppBuildGradle(config, (cfg) => {
    try {
      if (cfg.modResults.contents.includes('missingDimensionStrategy')) return cfg;
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /defaultConfig\s*\{/,
        'defaultConfig {\n            missingDimensionStrategy "store", "play"'
      );
    } catch (e) {
      console.warn('[withIAPFlavor] failed:', e);
    }
    return cfg;
  });
};
