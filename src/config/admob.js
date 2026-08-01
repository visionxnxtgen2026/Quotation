/**
 * Google AdMob Production Configuration for VisionX QuoteGen Pro Mobile
 */

export const ADMOB_CONFIG = {
  // Flag to toggle ads ON/OFF globally
  enabled: true,

  // Production mode (set to false for production release)
  isTesting: false,

  // Production Android Application ID
  appId: "ca-app-pub-5778328136445563~7367435229",

  // Production Ad Unit IDs
  adUnits: {
    banner: "ca-app-pub-5778328136445563/5619505217",
    interstitial: "ca-app-pub-5778328136445563/3647947994",
    appOpen: "ca-app-pub-5778328136445563/3488165890",
  },

  // Production Frequency Control Settings
  frequencyControl: {
    // Minimum time (in milliseconds) between Interstitial Ads (3 minutes = 180,000 ms)
    interstitialMinIntervalMs: 3 * 60 * 1000,

    // Minimum 3 meaningful user actions between interstitial ads
    minActionThreshold: 3,

    // App Open Ad cooldown limit (4 hours = 14,400,000 ms)
    appOpenCooldownMs: 4 * 60 * 60 * 1000,
  },
};
