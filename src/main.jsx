import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Multi-touch Gesture Guard: ONLY blocks multi-finger (2+ fingers) pinch gestures outside .allow-pinch-zoom
if (typeof window !== "undefined") {
  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches && e.touches.length > 1) {
        const isPinchAllowed = e.target && e.target.closest && e.target.closest(".allow-pinch-zoom");
        if (!isPinchAllowed) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      // Intercept ONLY multi-finger touch (2+ fingers) to allow 100% native single-finger vertical scrolling
      if (e.touches && e.touches.length > 1) {
        const isPinchAllowed = e.target && e.target.closest && e.target.closest(".allow-pinch-zoom");
        if (!isPinchAllowed) {
          e.preventDefault();
        }
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "gesturestart",
    (e) => {
      const isPinchAllowed = e.target && e.target.closest && e.target.closest(".allow-pinch-zoom");
      if (!isPinchAllowed) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener(
    "wheel",
    (e) => {
      if (e.ctrlKey) {
        const isPinchAllowed = e.target && e.target.closest && e.target.closest(".allow-pinch-zoom");
        if (!isPinchAllowed) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found ❌");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);