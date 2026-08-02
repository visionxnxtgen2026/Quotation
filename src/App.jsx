import { useState, useEffect, useRef, lazy, Suspense } from "react";

// 📊 EAGERLY LOADED CORE DASHBOARD FOR INSTANT (<100ms) STARTUP
import Dashboard from "./pages/dashboard/Dashboard";

// 🚀 LAZY LOADED ROUTE COMPONENTS FOR OPTIMAL BUNDLE SPLITTING
const CreateQuotation = lazy(() => import("./pages/dashboard/CreateQuotation"));
const Preview = lazy(() => import("./pages/dashboard/Preview"));
const QuotationsPage = lazy(() => import("./pages/dashboard/QuotationsPage"));
const ExportCenterPage = lazy(() => import("./pages/dashboard/ExportCenterPage"));
const ExportSharePage = lazy(() => import("./pages/dashboard/ExportSharePage"));
const ShareDrivePage = lazy(() => import("./pages/dashboard/ShareDrivePage"));
const EditProfile = lazy(() => import("./pages/dashboard/EditProfile"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const HelpSupport = lazy(() => import("./pages/dashboard/HelpSupport"));
const StorageManager = lazy(() => import("./pages/dashboard/StorageManager"));
const CloudBackupPage = lazy(() => import("./pages/settings/CloudBackupPage"));
const CompanyWorkspaceScreen = lazy(() => import("./components/settings/CompanyWorkspaceScreen"));

// 🔐 FIRST-LAUNCH LEGAL CONSENT
import LegalConsent, { hasAcceptedConsent } from "./pages/LegalConsent";
import BottomNavigation from "./components/mobile/BottomNavigation";
import MobileLayout from "./components/mobile/MobileLayout";
import { admobManager } from "./utils/admobManager";

import WorkspaceRestoreDetector from "./components/settings/cloud/WorkspaceRestoreDetector";
import CloudTransitionOverlay from "./components/cloud/CloudTransitionOverlay";

import SplashScreen from "./splash/SplashScreen";
import ExportErrorBoundary from "./components/export/ExportErrorBoundary";

function PageTransition({ children }) {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] animate-in fade-in-95 slide-in-from-right-1.5 duration-200 ease-out">
      {children}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [consentReady, setConsentReady] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [createStep, setCreateStep] = useState(1);
  const [quotationId, setQuotationId] = useState(null);
  const [companyWorkspaceId, setCompanyWorkspaceId] = useState(null);
  const [showCloudTransition, setShowCloudTransition] = useState(false);

  // Navigation History Stack to track full route state
  const historyStackRef = useRef([{ page: "dashboard", step: 1 }]);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Preload all chunk components immediately in background to eliminate white flashes
  useEffect(() => {
    const timer = setTimeout(() => {
      import("./pages/dashboard/CreateQuotation");
      import("./pages/dashboard/Preview");
      import("./pages/dashboard/QuotationsPage");
      import("./pages/dashboard/EditProfile");
      import("./pages/dashboard/Settings");
      import("./pages/dashboard/HelpSupport");
      import("./pages/dashboard/StorageManager");
      import("./pages/settings/CloudBackupPage");
      import("./components/settings/CompanyWorkspaceScreen");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
      if (path.startsWith("/settings/company/")) {
        const idFromUrl = path.replace("/settings/company/", "");
        if (idFromUrl) {
          setCompanyWorkspaceId(idFromUrl);
          setPage("company-workspace");
          return;
        }
      }
      if (path.includes("/cloud"))            setPage("cloud");
      else if (path.includes("/storage"))     setPage("storage");
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

  const triggerCloudNavigation = () => {
    setShowCloudTransition(true);
  };

  const handleCloudTransitionComplete = () => {
    setShowCloudTransition(false);
    pushState("cloud", 1);
  };

  const handleBack = () => {
    const stack = historyStackRef.current;
    if (stack.length > 1) {
      stack.pop(); // remove current page
      const prev = stack[stack.length - 1];
      setPage(prev.page);
      if (prev.page === "create") setCreateStep(prev.step || 4);
    } else {
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

  // 1. Android Native Edge Swipe Back Gesture Listener
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

  // 2. Capacitor Android Native Hardware Back Button & Deep Link Listener
  useEffect(() => {
    let unbindBack = null;
    let unbindUrl = null;

    if (window.Capacitor && window.Capacitor.isPluginAvailable("App")) {
      import(/* @vite-ignore */ "@capacitor/app").then(({ App }) => {
        App.addListener("backButton", () => {
          handleBack();
        }).then(l => { unbindBack = l; });

        App.addListener("appUrlOpen", (data) => {
          if (data && data.url) {
            console.log("[Android Deep Link Received]:", data.url);
            window.dispatchEvent(new CustomEvent("capacitorAppUrlOpen", { detail: data.url }));
          }
        }).then(l => { unbindUrl = l; });
      }).catch(() => {});
    }

    return () => {
      if (unbindBack && unbindBack.remove) unbindBack.remove();
      if (unbindUrl && unbindUrl.remove) unbindUrl.remove();
    };
  }, [page]);

  // 3. Browser Popstate History Listener
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setPage(e.state.page);
        if (e.state.page === "create") {
          let targetStep = e.state.step;
          if (!targetStep) {
            try {
              const draftStr = localStorage.getItem("previewDraft");
              if (draftStr) {
                const parsed = JSON.parse(draftStr);
                if (parsed.savedStep) targetStep = parsed.savedStep;
              }
            } catch (err) {}
          }
          setCreateStep(targetStep || 1);
        }
      } else {
        handleBack();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [page]);

  const navProps = {
    goToDashboard: () => pushState("dashboard", 1),
    goToCreate: (step) => {
      let targetStep = step;
      if (typeof targetStep !== "number") {
        try {
          const draftStr = localStorage.getItem("previewDraft");
          if (draftStr) {
            const parsed = JSON.parse(draftStr);
            if (parsed.savedStep) targetStep = parsed.savedStep;
          }
        } catch (err) {}
      }
      pushState("create", typeof targetStep === "number" ? targetStep : 1);
    },
    goToPreview: () => pushState("preview", 1),
    goToQuotations: () => pushState("quotations", 1),
    goToExport: () => pushState("export", 1),
    goToShareDrive: () => pushState("share-drive", 1),
    goToStorage: () => pushState("storage", 1),
    goToCloud: triggerCloudNavigation,
    goToEditProfile: () => pushState("edit-profile", 1),
    goToSettings: () => pushState("settings", 1),
    goToCompanyWorkspace: (companyId) => {
      setCompanyWorkspaceId(companyId);
      pushState("company-workspace", 1);
    },
    goToHelp: () => pushState("help", 1),
    goBack: handleBack,
  };

  const handleBottomNav = (targetPage) => {
    if (targetPage === "dashboard") navProps.goToDashboard();
    else if (targetPage === "create") navProps.goToCreate();
    else if (targetPage === "preview") navProps.goToPreview();
    else if (targetPage === "export") navProps.goToExport();
    else if (targetPage === "quotations") navProps.goToQuotations();
    else if (targetPage === "storage") navProps.goToStorage();
    else if (targetPage === "settings") navProps.goToSettings();
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

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

  const isTabPage = ["dashboard", "create", "preview", "export", "quotations", "storage", "settings", "cloud"].includes(page);
  const activePage = (typeof page === "string" && page.startsWith("settings/company"))
    ? "company-workspace"
    : page;

  return (
    <MobileLayout>
      {/* Cloud Workspace Transition Overlay */}
      <CloudTransitionOverlay
        isVisible={showCloudTransition}
        onComplete={handleCloudTransitionComplete}
      />

      <Suspense
        fallback={
          <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 animate-pulse shadow-xs">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        }
      >
        {activePage === "dashboard" && (
          <PageTransition>
            <Dashboard {...navProps} setQuotationId={setQuotationId} />
          </PageTransition>
        )}

        {activePage === "create" && (
          <PageTransition>
            <CreateQuotation
              {...navProps}
              goBack={handleBack}
              setQuotationId={setQuotationId}
              quotationId={quotationId}
              initialStep={createStep}
            />
          </PageTransition>
        )}

        {activePage === "preview" && (
          <PageTransition>
            <Preview
              {...navProps}
              goBack={() => navProps.goToCreate()}
              quotationId={quotationId}
            />
          </PageTransition>
        )}

        {activePage === "export" && (
          <PageTransition>
            <ExportErrorBoundary goBack={handleBack}>
              <ExportSharePage
                {...navProps}
                goBack={handleBack}
                quotationId={quotationId}
              />
            </ExportErrorBoundary>
          </PageTransition>
        )}

        {activePage === "share-drive" && (
          <PageTransition>
            <ExportErrorBoundary goBack={handleBack}>
              <ShareDrivePage
                {...navProps}
                goBack={handleBack}
                quotationId={quotationId}
              />
            </ExportErrorBoundary>
          </PageTransition>
        )}

        {activePage === "quotations" && (
          <PageTransition>
            <QuotationsPage
              {...navProps}
              setQuotationId={setQuotationId}
            />
          </PageTransition>
        )}

        {activePage === "storage" && (
          <PageTransition>
            <StorageManager {...navProps} goBack={handleBack} setQuotationId={setQuotationId} />
          </PageTransition>
        )}

        {activePage === "cloud" && (
          <PageTransition>
            <CloudBackupPage {...navProps} goBack={handleBack} />
          </PageTransition>
        )}

        {activePage === "edit-profile" && (
          <PageTransition>
            <EditProfile {...navProps} goBack={handleBack} />
          </PageTransition>
        )}

        {activePage === "settings" && (
          <PageTransition>
            <Settings {...navProps} goBack={handleBack} />
          </PageTransition>
        )}

        {activePage === "company-workspace" && (
          <PageTransition>
            <CompanyWorkspaceScreen
              profileId={companyWorkspaceId}
              onBack={() => navProps.goToSettings()}
              onSaved={() => {
                window.dispatchEvent(new Event("quotationDataUpdated"));
              }}
            />
          </PageTransition>
        )}

        {activePage === "help" && (
          <PageTransition>
            <HelpSupport {...navProps} goBack={handleBack} />
          </PageTransition>
        )}
      </Suspense>

      {isTabPage && (
        <BottomNavigation
          activeTab={page}
          onTabChange={handleBottomNav}
        />
      )}

      {/* Global Google Drive Workspace Restore Detector */}
      <WorkspaceRestoreDetector />

      {/* 🚀 Native ZERONYX Application Startup Splash Screen */}
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
          isAppReady={consentReady}
        />
      )}
    </MobileLayout>
  );
}
