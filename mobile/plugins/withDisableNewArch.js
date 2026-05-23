const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withDisableNewArch(config) {
  if (process.env.PREVIEW_BUILD !== '1') return config;
  return withGradleProperties(config, (cfg) => {
    const props = cfg.modResults;
    const idx = props.findIndex(
      (p) => p.type === 'property' && p.key === 'newArchEnabled'
    );
    if (idx !== -1) {
      props[idx] = { type: 'property', key: 'newArchEnabled', value: 'false' };
    } else {
      props.push({ type: 'property', key: 'newArchEnabled', value: 'false' });
    }
    return cfg;
  });
};
