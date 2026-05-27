const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withGradlePerf(config) {
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

      const isPreview = process.env.PREVIEW_BUILD === '1';

      // New arch required by reanimated v4
      addOrUpdate('newArchEnabled', 'true');
      // Daemon off for CI reproducibility
      addOrUpdate('org.gradle.daemon', 'false');
      addOrUpdate('kotlin.incremental', 'false');
      addOrUpdate('kotlin.incremental.java', 'false');
      // Force Kotlin to compile in the main Gradle JVM instead of spawning
      // separate worker JVMs (GradleKotlinCompilerRunnerWithWorkers) which
      // crash silently on memory-constrained CI runners.
      addOrUpdate('kotlin.compiler.execution.strategy', 'in-process');

      if (isPreview) {
        // Aggressive limits for preview (EAS free tier / resource-constrained)
        addOrUpdate('org.gradle.jvmargs', '-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseSerialGC -XX:+HeapDumpOnOutOfMemoryError');
        addOrUpdate('org.gradle.parallel', 'false');
        addOrUpdate('org.gradle.workers.max', '1');
        addOrUpdate('android.enableR8.fullMode', 'false');
      } else {
        // Production on GitHub Actions (7 GB RAM runner)
        // workers=1 + parallel=false prevents GradleKotlinCompilerRunnerWithWorkers
        // from spawning multiple JVMs that crash silently on 7 GB runners.
        addOrUpdate('org.gradle.jvmargs', '-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError');
        addOrUpdate('org.gradle.parallel', 'false');
        addOrUpdate('org.gradle.workers.max', '1');
        addOrUpdate('android.enableR8.fullMode', 'true');
        // Surface actual exception details if a worker action fails
        addOrUpdate('org.gradle.logging.stacktrace', 'all');
      }
    } catch (e) {
      console.warn('[withGradlePerf] failed:', e);
    }
    return cfg;
  });
};
