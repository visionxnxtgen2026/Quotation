import React, { useState, useEffect, useRef } from "react";

/**
 * 🎬 SplashVideo Component — Full-Screen Startup Splash Video
 * Plays a local video from /assets/video/ on app launch.
 * Automatically navigates to Dashboard when the video ends or fails.
 */
export default function SplashVideo({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const videoRef = useRef(null);

  // Handle Video Completion
  const handleFinish = () => {
    if (hasEnded) return;
    setHasEnded(true);
    setIsFadingOut(true);

    // Smooth 250ms fade-out transition then navigate
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 250);
  };

  useEffect(() => {
    // Check if splash already played this session
    try {
      if (sessionStorage.getItem("splash_video_played") === "true") {
        if (onFinish) onFinish();
        return;
      }
      sessionStorage.setItem("splash_video_played", "true");
    } catch (e) {}

    // Fallback safety timer: if video doesn't end within 8 seconds, finish automatically
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 8000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Try playing programmatically with safe unmount & AbortError catch
  useEffect(() => {
    let isMounted = true;
    const video = videoRef.current;

    if (video && document.contains(video)) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (isMounted && err.name !== "AbortError") {
            console.warn("[SplashVideo] Autoplay notice:", err);
            handleFinish();
          }
        });
      }
    }

    return () => {
      isMounted = false;
      if (video) {
        try {
          video.pause();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden transition-opacity duration-300 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        loop={false}
        onEnded={handleFinish}
        onError={() => {
          console.warn("[SplashVideo] Video failed to load. Skipping to Dashboard.");
          handleFinish();
        }}
        className="w-full h-full object-cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          border: "none",
          outline: "none"
        }}
      >
        <source src="/assets/video/splash.mp4" type="video/mp4" />
        <source src="/assets/video/zeronyx_splash.mp4" type="video/mp4" />
        <source src="/assets/video/splash.webm" type="video/webm" />
      </video>
    </div>
  );
}
