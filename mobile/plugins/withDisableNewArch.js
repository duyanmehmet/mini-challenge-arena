const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withDisableNewArch(config) {
  if (process.env.PREVIEW_BUILD !== '1') return config;
  return withGradleProperties(config, (cfg) => {
    try {
      const props = cfg.modResults;
      const addOrUpdate = (key, value) => {
        const idx = props.findIndex((p) => p.type === 'property' && p.key === key);
        if (idx !== -1) {
          props[idx] = { type: 'property', key, value };
        } else {
          props.push({ type: 'property', key, value });
        }
      };
      addOrUpdate('newArchEnabled', 'false');
      addOrUpdate('org.gradle.parallel', 'false');
      addOrUpdate('org.gradle.workers.max', '2');
    } catch (e) {
      console.warn('[withDisableNewArch] failed:', e);
    }
    return cfg;
  });
};
