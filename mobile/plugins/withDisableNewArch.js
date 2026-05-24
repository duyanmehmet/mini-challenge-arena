const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withGradlePerf(config) {
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
      // New arch required by reanimated v4
      addOrUpdate('newArchEnabled', 'true');
      // Aggressive memory limits to prevent OOM on EAS free tier
      addOrUpdate('org.gradle.jvmargs', '-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseSerialGC -XX:+HeapDumpOnOutOfMemoryError');
      addOrUpdate('org.gradle.parallel', 'false');
      addOrUpdate('org.gradle.workers.max', '1');
      addOrUpdate('org.gradle.daemon', 'false');
      addOrUpdate('kotlin.incremental', 'false');
      addOrUpdate('kotlin.incremental.java', 'false');
      addOrUpdate('android.enableR8.fullMode', 'false');
    } catch (e) {
      console.warn('[withGradlePerf] failed:', e);
    }
    return cfg;
  });
};
