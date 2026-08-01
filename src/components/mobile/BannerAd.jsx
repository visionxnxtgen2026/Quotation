import React, { useEffect, useState } from "react";
import { ADMOB_CONFIG } from "../../config/admob";

export default function BannerAd({ pageName = "page" }) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBanner() {
      if (!ADMOB_CONFIG.enabled) return;

      try {
        if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
          if (isMounted) setIsNative(true);
          const pkgName = "@capacitor-community/admob";
          const admobPlugin = await import(/* @vite-ignore */ pkgName);
          if (admobPlugin && admobPlugin.AdMob) {
            await admobPlugin.AdMob.showBanner({
              adId: ADMOB_CONFIG.adUnits.banner,
              adSize: admobPlugin.BannerAdSize.ADAPTIVE_BANNER || admobPlugin.BannerAdSize.BANNER,
              position: admobPlugin.BannerAdPosition.BOTTOM_CENTER,
              margin: 60, // Clear bottom navigation bar height
              isTesting: ADMOB_CONFIG.isTesting,
            });
            if (isMounted) setAdLoaded(true);
          }
        } else if (ADMOB_CONFIG.isTesting) {
          if (isMounted) setAdLoaded(true);
        }
      } catch (err) {
        console.warn(`[AdMob] Banner load notice on ${pageName}:`, err?.message || err);
        if (isMounted) setAdLoaded(false); // Hide gracefully if loading fails
      }
    }

    loadBanner();

    return () => {
      isMounted = false;
      if (window.Capacitor && window.Capacitor.isPluginAvailable("AdMob")) {
        const pkgName = "@capacitor-community/admob";
        import(/* @vite-ignore */ pkgName).then((m) => {
          if (m && m.AdMob) m.AdMob.hideBanner().catch(() => {});
        }).catch(() => {});
      }
    };
  }, [pageName]);

  // Native Capacitor AdMob renders natively over the WebView; no inline web elements required
  if (isNative || !adLoaded || !ADMOB_CONFIG.enabled) {
    return <div className="h-14 w-full print:hidden" aria-hidden="true" />;
  }

  // Developer Test Placeholder (Only rendered in Web Test Mode when isTesting is true)
  if (ADMOB_CONFIG.isTesting) {
    return (
      <div className="w-full my-3 px-4 print:hidden">
        <div className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-2.5 px-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">AdMob</span>
            <span className="text-[11px] font-bold text-slate-700 truncate">Production Banner ({pageName})</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">ID: ...{ADMOB_CONFIG.adUnits.banner.slice(-6)}</span>
        </div>
      </div>
    );
  }

  return null;
}
