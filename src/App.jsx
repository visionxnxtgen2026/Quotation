import { useState, useEffect, useRef } from "react";

// 📊 MOBILE DASHBOARD PAGES
import Dashboard from "./pages/dashboard/Dashboard";
import CreateQuotation from "./pages/dashboard/CreateQuotation";
import Preview from "./pages/dashboard/Preview";
import Export from "./pages/dashboard/Export";
import EditProfile from "./pages/dashboard/EditProfile";

// ⚙️ SETTINGS & STORAGE PAGES
import Settings from "./pages/dashboard/Settings";
import HelpSupport from "./pages/dashboard/HelpSupport";
import StorageManager from "./pages/dashboard/StorageManager";

// 🔐 FIRST-LAUNCH LEGAL CONSENT
import LegalConsent, { hasAcceptedConsent } from "./pages/LegalConsent";
import BottomNavigation from "./components/mobile/BottomNavigation";
import MobileLayout from "./components/mobile/MobileLayout";
import { admobManager } from "./utils/admobManager";

export default function App() {
  const [consentReady, setConsentReady] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [createStep, setCreateStep] = useState(1);
  const [quotationId, setQuotationId] = useState(null);

  // Navigation History Stack to track full route state
  const historyStackRef = useRef([{ page: "dashboard", step: 1 }]);
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    admobManager.initialize();

    const accepted = hasAcceptedConsent();
    setConsentAccepted(accepted);
    setConsentReady(true);

    if (accepted) {
      const path = window.location.pathname;
      if (path.startsWith("/preview/")) {
        const idFromUrl = path.split("/")[2];
        if (idFromUrl) {
          setQuotationId(idFromUrl);
          setPage("preview");
          return;
        }
      }
      if (path.includes("/storage"))          setPage("storage");
      else if (path.includes("/edit-profile")) setPage("edit-profile");
      else if (path.includes("/settings"))     setPage("settings");
      else if (path.includes("/help"))         setPage("help");
      else if (path.includes("/create"))       setPage("create");
      else if (path.includes("/preview"))      setPage("preview");
      else if (path.includes("/export"))       setPage("export");
      else                                     setPage("dashboard");
    }
  }, []);

  const pushState = (newPage, rawStep = 1) => {
    // Strictly sanitize step parameter to ensure non-serializable objects (like PointerEvent/MouseEvent) are NEVER passed to window.history.pushState
    const step = typeof rawStep === "number" ? rawStep : 1;
    const historyPayload = { page: String(newPage), step };

    try {
      historyStackRef.current.push(historyPayload);
      window.history.pushState(historyPayload, "", `/${newPage}`);
    } catch (err) {
      console.warn("pushState serialization fallback notice:", err);
      window.history.pushState({ page: String(newPage), step: 1 }, "", `/${newPage}`);
    }

    setPage(newPage);
    if (newPage === "create") setCreateStep(step);
  };

  const handleBack = () => {
    const stack = historyStackRef.current;
    if (stack.length > 1) {
      stack.pop(); // remove current page
      const prev = stack[stack.length - 1];
      setPage(prev.page);
      if (prev.page === "create") setCreateStep(prev.step || 4);
    } else {
      // Default fallbacks
      if (page === "preview") {
        setPage("create");
        setCreateStep(4);
      } else if (page === "export") {
        setPage("preview");
      } else if (page === "create") {
        setPage("dashboard");
      } else if (page !== "dashboard") {
        setPage("dashboard");
      }
    }
  };

  // 1. Android Native Edge Swipe Back Gesture Listener (Left edge swipe right)
  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const startX = touchStartRef.current.x;
      const startY = touchStartRef.current.y;
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);

      // Trigger back navigation if left edge swipe right (startX < 40px and horizontal swipe > 60px)
      if (startX < 40 && deltaX > 60 && deltaY < 40) {
        handleBack();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [page]);

  // 2. Capacitor Android Native Hardware Back Button Listener
  useEffect(() => {
    let unbind = null;
    if (window.Capacitor && window.Capacitor.isPluginAvailable("App")) {
      import(/* @vite-ignore */ "@capacitor/app").then(({ App }) => {
        App.addListener("backButton", () => {
          handleBack();
        }).then(listener => {
          unbind = listener;
        });
      }).catch(() => {});
    }

    return () => {
      if (unbind && unbind.remove) unbind.remove();
    };
  }, [page]);

  // 3. Browser Popstate History Listener
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
        if (e.state.page === "create") setCreateStep(e.state.step || 4);
      } else {
        handleBack();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [page]);

  const navProps = {
    goToDashboard: () => pushState("dashboard", 1),
    goToCreate: (step) => pushState("create", typeof step === "number" ? step : 1),
    goToPreview: () => pushState("preview", 1),
    goToExport: () => pushState("export", 1),
    goToStorage: () => pushState("storage", 1),
    goToEditProfile: () => pushState("edit-profile", 1),
    goToSettings: () => pushState("settings", 1),
    goToHelp: () => pushState("help", 1),
    goBack: handleBack,
  };

  const handleBottomNav = (targetPage) => {
    if (targetPage === "dashboard") navProps.goToDashboard();
    else if (targetPage === "create") navProps.goToCreate(1);
    else if (targetPage === "preview") navProps.goToPreview();
    else if (targetPage === "storage") navProps.goToStorage();
    else if (targetPage === "settings") navProps.goToSettings();
  };

  if (!consentReady) return null;

  if (!consentAccepted) {
    return (
      <LegalConsent
        onAccept={() => {
          setConsentAccepted(true);
          setPage("dashboard");
        }}
      />
    );
  }

  const isTabPage = ["dashboard", "create", "preview", "export", "storage", "settings"].includes(page);

  return (
    <MobileLayout>
      {page === "dashboard" && (
        <Dashboard {...navProps} setQuotationId={setQuotationId} />
      )}

      {page === "create" && (
        <CreateQuotation
          {...navProps}
          goBack={handleBack}
          setQuotationId={setQuotationId}
          quotationId={quotationId}
          initialStep={createStep}
        />
      )}

      {page === "preview" && (
        <Preview
          {...navProps}
          goBack={() => navProps.goToCreate(4)}
          quotationId={quotationId}
        />
      )}

      {page === "export" && (
        <Export
          {...navProps}
          goBack={navProps.goToPreview}
          quotationId={quotationId}
        />
      )}

      {page === "storage" && (
        <StorageManager {...navProps} goBack={handleBack} setQuotationId={setQuotationId} />
      )}

      {page === "edit-profile" && (
        <EditProfile {...navProps} goBack={handleBack} />
      )}

      {page === "settings" && (
        <Settings {...navProps} goBack={handleBack} />
      )}

      {page === "help" && (
        <HelpSupport {...navProps} goBack={handleBack} />
      )}

      {isTabPage && (
        <BottomNavigation
          activeTab={page}
          onTabChange={handleBottomNav}
        />
      )}
    </MobileLayout>
  );
}
