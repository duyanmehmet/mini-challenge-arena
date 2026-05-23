const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdMob(config) {
  return withAndroidManifest(config, (config) => {
    const mainApp = config.modResults.manifest.application[0];
    if (!mainApp['meta-data']) mainApp['meta-data'] = [];
    mainApp['meta-data'] = mainApp['meta-data'].filter(
      (item) => item.$?.['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );
    mainApp['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': 'ca-app-pub-4780904817875688~4613037151',
      },
    });
    return config;
  });
};
