const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

function withAndroidDependencyFix(config) {
  // Fix for project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Add any project-level fixes here if needed
    }
    return config;
  });

  // Fix for app-level build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Ensure proper dependency resolution
      if (!config.modResults.contents.includes('androidx.lifecycle:lifecycle-common-java8')) {
        config.modResults.contents = config.modResults.contents.replace(
          'dependencies {',
          `dependencies {
    implementation "androidx.lifecycle:lifecycle-common-java8:2.6.2"`
        );
      }
    }
    return config;
  });

  return config;
}

module.exports = withAndroidDependencyFix;
