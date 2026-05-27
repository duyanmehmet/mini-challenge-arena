const { withProjectBuildGradle } = require('@expo/config-plugins');

// react-native-google-mobile-ads@14.x has Kotlin 2.1.x (K2 compiler) compatibility
// issues. Uses allprojects + configureEach (lazy) to avoid afterEvaluate timing errors.
module.exports = function withGAdsKotlinFix(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes('// withGAdsKotlinFix')) {
      return cfg;
    }

    cfg.modResults.contents += `

// withGAdsKotlinFix: suppress Kotlin 2.x compilation errors in all subprojects
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile.class).configureEach { task ->
        task.kotlinOptions {
            allWarningsAsErrors = false
            suppressWarnings = false
        }
    }
}
`;
    return cfg;
  });
};
