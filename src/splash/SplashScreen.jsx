import React from "react";
import SplashVideo from "./SplashVideo";

/**
 * Re-export SplashVideo as default SplashScreen component
 * Ensures zero old animations or spinners are displayed.
 */
export default function SplashScreen({ onFinish }) {
  return <SplashVideo onFinish={onFinish} />;
}

export { SplashVideo };
