import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../widgets/gold_particles.dart';
import '../utils/sound_manager.dart';

/// 📱 Target Dashboard Destination Screen
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.dashboard_rounded, size: 64, color: Color(0xFF1E90FF)),
            SizedBox(height: 16),
            Text(
              "ZERONYX Dashboard",
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// 🚀 Premium ZERONYX Native Startup Splash Screen
class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  /// Session guard flag - shows splash only ONCE per app launch session
  static bool hasShownThisSession = false;

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final SoundManager _soundManager = SoundManager();

  double _opacityFadeOut = 1.0;
  bool _audioBlockedOnWeb = false;

  final String _line1Text = "ZERONYX";
  final String _line2Text = "INNOVATE. BUILD. ELEVATE.";

  @override
  void initState() {
    super.initState();

    // Fullscreen System UI Overlay
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ));

    // Single 4.0 Seconds Animation Controller @ 60FPS
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4000),
    );

    _controller.addStatusListener(_onAnimationStatus);

    // Pre-cache logo image & play audio immediately at t = 0s
    WidgetsBinding.instance.addPostFrameCallback((_) {
      precacheImage(const AssetImage('assets/logo/zx_logo.png'), context).catchError((_) {});
      _startSplashSequence();
    });
  }

  Future<void> _startSplashSequence() async {
    // Session Guard Check: show splash only first time per app launch session
    if (SplashScreen.hasShownThisSession) {
      _navigateToDashboardDirectly();
      return;
    }

    SplashScreen.hasShownThisSession = true;

    // 🔊 CRITICAL SOUND FIX: Play full splash sound IMMEDIATELY at t = 0s
    try {
      await _soundManager.playFullSplashSound();
    } catch (e) {
      if (kIsWeb) {
        setState(() {
          _audioBlockedOnWeb = true;
        });
      }
      if (kDebugMode) {
        print("[SplashScreen Audio Notice] Audio playback continued silently: $e");
      }
    }

    // Start 4.0s animation controller
    _controller.forward(from: 0.0);
  }

  void _onAnimationStatus(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      // 4.0s reached -> 300ms fade out to transparent then push replacement
      setState(() {
        _opacityFadeOut = 0.0;
      });

      Timer(const Duration(milliseconds: 300), () {
        _navigateToDashboard();
      });
    }
  }

  void _navigateToDashboardDirectly() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const DashboardScreen(),
        transitionDuration: Duration.zero,
      ),
    );
  }

  void _navigateToDashboard() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const DashboardScreen(),
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  void dispose() {
    _controller.removeStatusListener(_onAnimationStatus);
    _controller.dispose();
    _soundManager.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;

    // Center ZX Logo at 62% width (max 280px)
    final logoWidth = (screenWidth * 0.62).clamp(180.0, 280.0);

    return Scaffold(
      backgroundColor: Colors.black,
      body: AnimatedOpacity(
        opacity: _opacityFadeOut,
        duration: const Duration(milliseconds: 300),
        child: Stack(
          children: [
            // 🌟 1. GPU-Accelerated Golden Bokeh Particle Canvas (RepaintBoundary)
            Positioned.fill(
              child: GoldParticlesWidget(animationController: _controller),
            ),

            // 🔊 Web Autoplay Fallback Unmute / Dev Mute Toggle Button
            Positioned(
              top: mediaQuery.padding.top + 12,
              right: 16,
              child: IconButton(
                icon: Icon(
                  _soundManager.isMuted
                      ? Icons.volume_off_rounded
                      : (_audioBlockedOnWeb ? Icons.volume_mute_rounded : Icons.volume_up_rounded),
                  color: _audioBlockedOnWeb ? const Color(0xFF1E90FF) : Colors.white38,
                  size: 22,
                ),
                onPressed: () {
                  setState(() {
                    _audioBlockedOnWeb = false;
                    _soundManager.toggleMute();
                    if (!_soundManager.isMuted) {
                      _soundManager.playFullSplashSound();
                    }
                  });
                },
              ),
            ),

            // 🎯 2. Central Animation Timeline Composition
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                final double sec = _controller.value * 4.0; // 0.0s to 4.0s

                // --- 0.6s - 1.6s: Logo Fade-In & Scale (0.85 -> 1.0) ---
                double logoOpacity = 0.0;
                double logoScale = 0.85;

                if (sec >= 0.6) {
                  final double t = ((sec - 0.6) / 1.0).clamp(0.0, 1.0);
                  final double curve = Curves.easeOutCubic.transform(t);
                  logoOpacity = curve;
                  logoScale = 0.85 + (0.15 * curve);
                }

                // --- Metallic Light Sweep Progress (0.6s -> 1.6s) ---
                double sweepProgress = -0.5;
                if (sec >= 0.6 && sec <= 1.6) {
                  sweepProgress = -0.5 + (((sec - 0.6) / 1.0) * 2.0);
                } else if (sec > 1.6) {
                  sweepProgress = 1.5;
                }

                // --- Line 1 Typewriter progress (2.0s -> 2.8s) ---
                int line1CharCount = 0;
                if (sec >= 2.0) {
                  final double t = ((sec - 2.0) / 0.8).clamp(0.0, 1.0);
                  line1CharCount = (t * _line1Text.length).floor().clamp(0, _line1Text.length);
                }

                // --- Line 2 Typewriter progress (2.8s -> 3.6s) ---
                int line2CharCount = 0;
                if (sec >= 2.8) {
                  final double t = ((sec - 2.8) / 0.8).clamp(0.0, 1.0);
                  line2CharCount = (t * _line2Text.length).floor().clamp(0, _line2Text.length);
                }

                // --- 3.6s - 4.0s: Electric Blue Glow Pulse on X ---
                bool isXGlowPulse = sec >= 3.6 && sec <= 4.0;

                return Positioned.fill(
                  child: Stack(
                    children: [
                      // 🏆 ZX Logo Centered at 40% Screen Height
                      Positioned(
                        top: screenHeight * 0.30,
                        left: (screenWidth - logoWidth) / 2,
                        width: logoWidth,
                        height: logoWidth,
                        child: Transform.scale(
                          scale: logoScale,
                          child: Opacity(
                            opacity: logoOpacity,
                            child: Stack(
                              children: [
                                // Subtle X Glow Pulse Blur (3.6s - 4.0s)
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 300),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(24),
                                    boxShadow: isXGlowPulse
                                        ? [
                                            BoxShadow(
                                              color: const Color(0xFF1E90FF).withOpacity(0.65),
                                              blurRadius: 30,
                                              spreadRadius: 8,
                                            ),
                                          ]
                                        : [],
                                  ),
                                ),

                                // ZX Logo Image Asset
                                Image.asset(
                                  'assets/logo/zx_logo.png',
                                  width: logoWidth,
                                  height: logoWidth,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => _buildFallbackLogo(logoWidth),
                                ),

                                // Metallic Light Sweep White Diagonal Gradient (30% width)
                                if (sec >= 0.6 && sec <= 1.6)
                                  Positioned.fill(
                                    child: ShaderMask(
                                      shaderCallback: (bounds) {
                                        return LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          stops: [
                                            (sweepProgress - 0.3).clamp(0.0, 1.0),
                                            sweepProgress.clamp(0.0, 1.0),
                                            (sweepProgress + 0.3).clamp(0.0, 1.0),
                                          ],
                                          colors: [
                                            Colors.transparent,
                                            Colors.white.withOpacity(0.85),
                                            Colors.transparent,
                                          ],
                                        ).createShader(bounds);
                                      },
                                      blendMode: BlendMode.screen,
                                      child: Container(color: Colors.white),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // 🏷️ Typewriter Text Lines Below Logo
                      Positioned(
                        top: (screenHeight * 0.30) + logoWidth + 24,
                        left: 0,
                        right: 0,
                        child: Column(
                          children: [
                            // Line 1: "ZERONYX"
                            if (sec >= 2.0)
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: List.generate(_line1Text.length, (index) {
                                  final char = _line1Text[index];
                                  final isVisible = index < line1CharCount;
                                  final isBlue = index >= 4; // N, Y, X in #1E90FF

                                  return Opacity(
                                    opacity: isVisible ? 1.0 : 0.0,
                                    child: Text(
                                      char,
                                      style: TextStyle(
                                        color: isBlue ? const Color(0xFF1E90FF) : Colors.white,
                                        fontSize: 28,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 6,
                                        fontFamily: 'sans-serif',
                                        shadows: isBlue && isXGlowPulse
                                            ? const [
                                                Shadow(
                                                  color: Color(0xFF1E90FF),
                                                  blurRadius: 18,
                                                )
                                              ]
                                            : null,
                                      ),
                                    ),
                                  );
                                }),
                              ),

                            const SizedBox(height: 12),

                            // Line 2: "INNOVATE. BUILD. ELEVATE."
                            if (sec >= 2.8)
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: List.generate(_line2Text.length, (index) {
                                  final char = _line2Text[index];
                                  final isVisible = index < line2CharCount;
                                  final isDot = char == '.';

                                  return Opacity(
                                    opacity: isVisible ? (isDot ? 1.0 : 0.9) : 0.0,
                                    child: Text(
                                      char,
                                      style: TextStyle(
                                        color: isDot ? const Color(0xFF1E90FF) : const Color(0xFF8A8A8A),
                                        fontSize: 9,
                                        letterSpacing: 3,
                                        fontWeight: FontWeight.w500,
                                        fontFamily: 'sans-serif',
                                      ),
                                    ),
                                  );
                                }),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  /// Fallback vector logo badge if asset is buffering
  Widget _buildFallbackLogo(double size) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: Colors.white10),
      ),
      child: Center(
        child: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: "Z",
                style: TextStyle(
                  color: Color(0xFFE2E8F0),
                  fontSize: 52,
                  fontWeight: FontWeight.bold,
                  fontStyle: FontStyle.italic,
                ),
              ),
              TextSpan(
                text: "X",
                style: TextStyle(
                  color: Color(0xFF1E90FF),
                  fontSize: 52,
                  fontWeight: FontWeight.bold,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
