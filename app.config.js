const appJson = {
  expo: {
    jsEngine: "hermes",
    name: "kronop",
    slug: "kronop-app",
    version: "1.0.0",
    sdkVersion: "54.0.0",
    scheme: "kronop",
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
    android: {
      package: "com.kronopaman.kronop"
    },
    ios: {
      bundleIdentifier: "com.kronopaman.kronop"
    },
    plugins: [
      "./plugins/android-dependency-fix.js",
      "expo-router",
      "expo-video",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos",
          "isAccessMediaLocationEnabled": true
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos"
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location"
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.kronop",
          "enableGooglePay": true
        }
      ],
      [
        "expo-build-properties",
        {
          "android": {
            "hermesEnabled": true,
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "kotlinVersion": "1.9.25",
            "newArchEnabled": false,
            "repositories": [
              "google()",
              "mavenCentral()",
              "jitpack"
            ],
            "extraProguardRules": "",
            "enableProguardInReleaseBuilds": false
          },
          "ios": {
            "newArchEnabled": false
          }
        }
      ],
      "@stripe/stripe-react-native",
      "expo-router",
      "expo-video",
      "expo-notifications",
      "expo-updates",
      "expo-asset",
      "expo-splash-screen",
      "@react-native-google-signin/google-signin",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location.",
          "locationWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location"
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
          "isAccessMediaLocationEnabled": true
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
        }
      ],
      [
        "expo-contacts",
        {
          "accessesContacts": true,
          "contactsPermission": "Allow $(PRODUCT_NAME) to access your contacts."
        }
      ],
      "expo-dev-client"
    ],
    extra: {
      eas: {
        projectId: "1e37a483-44cc-49dc-8247-25b4f06dfe97"
      }
    }
  }
};

module.exports = appJson;