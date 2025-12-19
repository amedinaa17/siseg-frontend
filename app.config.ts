export default {
  expo: {
    name: "SISEG",
    slug: "SISEG",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./activos/imagenes/favicon.png",
    scheme: "SISEG",

    extra: {
      API_URL: process.env.API_URL,
      MANUAL_URL: process.env.MANUAL_URL,
      FORMATO_URL: process.env.FORMATO_URL,
      GOOGLE_MAPS_API_KEY:
        process.env.GOOGLE_MAPS_API_KEY || "AIzaSyAN9dlyun_A3YnM9gR3NbMob6y6IPntkNA",
      eas: {
        projectId: '733f616e-e525-4a99-921e-38393a115507'
      }
    },

    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      adaptiveIcon: {
        foregroundImage: "./activos/imagenes/favicon.png",
      },
      bundleIdentifier: "com.tt2025b020.siseg",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },

    android: {
      package: "com.tt2025b020.siseg",
      adaptiveIcon: {
        foregroundImage: "./activos/imagenes/favicon.png",
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey:
            process.env.GOOGLE_MAPS_API_KEY ||
            "AIzaSyAN9dlyun_A3YnM9gR3NbMob6y6IPntkNA",
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./activos/imagenes/icon.png",
      name: "SISEG"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./activos/imagenes/favicon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store",
      "expo-font"
    ],

    experiments: {
      typedRoutes: true
    }
  }
};