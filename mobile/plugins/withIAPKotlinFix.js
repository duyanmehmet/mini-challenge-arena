const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// react-native-iap@12.x uses `currentActivity` which was removed in RN 0.81.
// Patch RNIapModule.kt to use reactContext.currentActivity instead.
module.exports = function withIAPKotlinFix(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const ktFile = path.join(
        cfg.modRequest.projectRoot,
        'node_modules',
        'react-native-iap',
        'android',
        'src',
        'play',
        'java',
        'com',
        'dooboolab',
        'rniap',
        'RNIapModule.kt',
      );

      if (!fs.existsSync(ktFile)) {
        console.warn('[withIAPKotlinFix] RNIapModule.kt not found, skipping patch');
        return cfg;
      }

      const original = fs.readFileSync(ktFile, 'utf8');
      const patched = original.replace(
        'val activity = currentActivity',
        'val activity = reactContext.currentActivity',
      );

      if (patched !== original) {
        fs.writeFileSync(ktFile, patched, 'utf8');
        console.log('[withIAPKotlinFix] Patched RNIapModule.kt');
      }

      return cfg;
    },
  ]);
};
