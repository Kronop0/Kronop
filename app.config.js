const appJson = {
  expo: {
    jsEngine: "hermes",
    name: "kronop",
    slug: "kronop-app",
    version: "1.0.0",
    sdkVersion: "54.0.0",
    assetBundlePatterns: [
      "*/"
    ],
    runtimeVersion: "1.0.0",
    install: {
      exclude: ["expo-updates", "expo-splash-screen"]
    },
    updates: {
      enabled: true,
      channel: "production",
      url: "https://u.expo.dev/92c8cf01-bba1-4123-80ff-3d6b7bfa0ab6"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
    }
  }
};

module.exports = appJson;