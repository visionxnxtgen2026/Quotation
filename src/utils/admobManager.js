import { ADMOB_CONFIG } from "../config/admob";

async function loadNativeAdMob() {
  try {
    const pkg = "@capacitor-community/admob";
    return await import(/* @vite-ignore */ pkg);
  } catch (err) {
    return null;
  }
}

class AdMobManager {
  constructor() {
    this.initialized = false;
    this.lastInterstitialTime = 0;
    this.actionCount = 0;
    this.lastAppOpenTime = 0;
    this.isInterstitialShowing = false;
    this.interstitialPreloaded = false;
  }

  /**
   * Initialize Google Mobile Ads SDK safely (executed once on app launch)
   */
  async initialize() {
    if (!ADMOB_CONFIG.enabled || this.initialized) return;

    try {
      if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
        const admobPlugin = await loadNativeAdMob();
        if (admobPlugin && admobPlugin.AdMob) {
          await admobPlugin.AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: ADMOB_CONFIG.isTesting ? [ADMOB_CONFIG.appId] : [],
            initializeForTesting: ADMOB_CONFIG.isTesting,
          });
          console.log("[AdMob Production] Google Mobile Ads SDK Initialized Successfully");
          this.preloadInterstitial();
        }
      }
      this.initialized = true;
      this.showAppOpenAd();
    } catch (err) {
      console.warn("[AdMob] SDK Initialization notice (Offline/Network):", err?.message || err);
      this.initialized = true;
    }
  }

  /**
   * Preload Interstitial Ad asynchronously
   */
  async preloadInterstitial() {
    if (!ADMOB_CONFIG.enabled || this.interstitialPreloaded) return;
    try {
      if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
        const admobPlugin = await loadNativeAdMob();
        if (admobPlugin && admobPlugin.AdMob) {
          await admobPlugin.AdMob.prepareInterstitial({
            adId: ADMOB_CONFIG.adUnits.interstitial,
            isTesting: ADMOB_CONFIG.isTesting,
          });
          this.interstitialPreloaded = true;
        }
      }
    } catch (err) {
      console.warn("[AdMob] Interstitial preload notice:", err?.message || err);
    }
  }

  recordAction() {
    this.actionCount += 1;
  }

  canShowInterstitial() {
    if (!ADMOB_CONFIG.enabled || this.isInterstitialShowing) return false;
    const now = Date.now();
    const timeElapsed = now - this.lastInterstitialTime;
    const intervalOk = timeElapsed >= ADMOB_CONFIG.frequencyControl.interstitialMinIntervalMs;
    const thresholdOk = this.actionCount >= ADMOB_CONFIG.frequencyControl.minActionThreshold;
    return intervalOk && thresholdOk;
  }

  /**
   * Show Interstitial Ad ONLY at natural transition points (Before Preview, Before Export, Download PDF)
   */
  async showInterstitial(actionName = "transition") {
    this.recordAction();

    if (!this.canShowInterstitial()) {
      console.log(`[AdMob] Interstitial skipped for '${actionName}' (Frequency limit active)`);
      return false;
    }

    try {
      this.isInterstitialShowing = true;
      console.log(`[AdMob] Displaying Interstitial Ad for '${actionName}'...`);

      if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
        const admobPlugin = await loadNativeAdMob();
        if (admobPlugin && admobPlugin.AdMob) {
          if (!this.interstitialPreloaded) {
            await admobPlugin.AdMob.prepareInterstitial({
              adId: ADMOB_CONFIG.adUnits.interstitial,
              isTesting: ADMOB_CONFIG.isTesting,
            });
          }
          await admobPlugin.AdMob.showInterstitial();
        }
      } else {
        console.log(`[AdMob Production Test] Interstitial Ad Displayed for ${actionName}`);
      }

      this.lastInterstitialTime = Date.now();
      this.actionCount = 0;
      this.interstitialPreloaded = false;
      
      // Auto-reload next interstitial in background
      setTimeout(() => this.preloadInterstitial(), 2000);
      return true;
    } catch (err) {
      console.warn("[AdMob] Interstitial display notice:", err?.message || err);
      return false;
    } finally {
      this.isInterstitialShowing = false;
    }
  }

  /**
   * Show App Open Ad on cold start or background resume (Max once every 4 hours)
   */
  async showAppOpenAd() {
    if (!ADMOB_CONFIG.enabled) return;

    const now = Date.now();
    if (now - this.lastAppOpenTime < ADMOB_CONFIG.frequencyControl.appOpenCooldownMs) {
      console.log("[AdMob] App Open Ad skipped (4-hour cooldown active)");
      return;
    }

    try {
      console.log("[AdMob] Displaying App Open Ad...");
      if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
        const admobPlugin = await loadNativeAdMob();
        if (admobPlugin && admobPlugin.AdMob) {
          await admobPlugin.AdMob.prepareInterstitial({
            adId: ADMOB_CONFIG.adUnits.appOpen,
            isTesting: ADMOB_CONFIG.isTesting,
          });
          await admobPlugin.AdMob.showInterstitial();
        }
      }
      this.lastAppOpenTime = Date.now();
    } catch (err) {
      console.warn("[AdMob] App Open Ad notice:", err?.message || err);
    }
  }
}

export const admobManager = new AdMobManager();
