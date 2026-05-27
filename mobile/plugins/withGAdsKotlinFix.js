const { withProjectBuildGradle } = require('@expo/config-plugins');

// react-native-google-mobile-ads@14.x has Kotlin 2.1.x (K2 compiler) compatibility
// issues. This plugin patches the root build.gradle to suppress allWarningsAsErrors
// and add freeCompilerArgs for the specific subproject so compilation succeeds.
module.exports = function withGAdsKotlinFix(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes('// withGAdsKotlinFix')) {
      return cfg;
    }

    cfg.modResults.contents += `

// withGAdsKotlinFix: suppress Kotlin 2.x compilation errors in react-native-google-mobile-ads
subprojects {
    afterEvaluate { proj ->
        if (proj.name == "react-native-google-mobile-ads") {
            proj.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile.class).configureEach { task ->
                task.kotlinOptions {
                    allWarningsAsErrors = false
                    suppressWarnings = false
                    freeCompilerArgs += [
                        "-Xsuppress-warning=DEPRECATION",
                        "-Xsuppress-warning=UNCHECKED_CAST",
                        "-Xsuppress-warning=NOTHING_TO_INLINE"
                    ]
                }
            }
        }
    }
}
`;
    return cfg;
  });
};
