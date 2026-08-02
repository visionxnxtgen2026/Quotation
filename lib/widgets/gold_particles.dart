import 'dart:math';
import 'package:flutter/material.dart';

/// 🌟 Golden Bokeh Dust Particle Data Model
class GoldParticle {
  double x;
  double y;
  double vx;
  double vy;
  double size;
  double baseOpacity;
  double twinkleSpeed;
  double twinklePhase;
  Color color;
  double blur;

  GoldParticle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.size,
    required this.baseOpacity,
    required this.twinkleSpeed,
    required this.twinklePhase,
    required this.color,
    required this.blur,
  });

  static List<Color> goldPalette = const [
    Color(0xFFFFD700), // Pure Gold
    Color(0xFFD4AF37), // Metallic Gold
    Color(0xFFFFEB8A), // Light Gold Flare
    Color(0xFFC9A227), // Deep Antique Gold
    Color(0xFFFFF4BD), // Champagne Shimmer
  ];

  factory GoldParticle.random(double width, double height, Random random) {
    return GoldParticle(
      x: random.nextDouble() * width,
      y: random.nextDouble() * height + random.nextDouble() * 200,
      vx: (random.nextDouble() - 0.5) * 0.22,
      vy: -(0.15 + random.nextDouble() * 0.55),
      size: 1.0 + random.nextDouble() * 2.0, // 1 - 3px
      baseOpacity: 0.2 + random.nextDouble() * 0.6, // 0.2 - 0.8
      twinkleSpeed: 0.6 + random.nextDouble() * 2.2,
      twinklePhase: random.nextDouble() * pi * 2,
      color: goldPalette[random.nextInt(goldPalette.length)],
      blur: random.nextDouble() > 0.6 ? 2.0 + random.nextDouble() * 4.0 : 0.0,
    );
  }
}

/// 🎨 Ultra-High Performance 60FPS CustomPainter for 80 Gold Bokeh Dust Particles
class GoldParticlesPainter extends CustomPainter {
  final List<GoldParticle> particles;
  final double animationValue;

  GoldParticlesPainter({
    required this.particles,
    required this.animationValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (size.width <= 0 || size.height <= 0) return;

    for (var p in particles) {
      // Upward position update based on animation loop
      p.x += p.vx;
      p.y += p.vy;
      p.twinklePhase += p.twinkleSpeed * 0.016;

      // Wrap around canvas screen boundaries
      if (p.y < -20) {
        p.y = size.height + 20 + Random().nextDouble() * 80;
        p.x = Random().nextDouble() * size.width;
      }
      if (p.x < -20) p.x = size.width + 20;
      if (p.x > size.width + 20) p.x = -20;

      // Twinkle opacity oscillation
      final twinkle = 0.5 + 0.5 * sin(p.twinklePhase);
      final currentOpacity = (p.baseOpacity * (0.4 + 0.6 * twinkle)).clamp(0.0, 1.0);

      final paint = Paint()
        ..color = p.color.withOpacity(currentOpacity)
        ..style = PaintingStyle.fill;

      // Soft glow blur if particle has blur radius
      if (p.blur > 0) {
        paint.maskFilter = MaskFilter.blur(BlurStyle.normal, p.blur);
      }

      // Draw particle circle dot
      canvas.drawCircle(Offset(p.x, p.y), p.size, paint);
    }
  }

  @override
  bool shouldRepaint(covariant GoldParticlesPainter oldDelegate) => true;
}

/// 🚀 Gold Particles Widget Wrapper using RepaintBoundary & AnimatedBuilder
class GoldParticlesWidget extends StatefulWidget {
  final AnimationController animationController;

  const GoldParticlesWidget({
    Key? key,
    required this.animationController,
  }) : super(key: key);

  @override
  State<GoldParticlesWidget> createState() => _GoldParticlesWidgetState();
}

class _GoldParticlesWidgetState extends State<GoldParticlesWidget> {
  late List<GoldParticle> _particles;
  final Random _random = Random();
  bool _initialized = false;

  void _initParticles(Size size) {
    if (_initialized) return;
    _particles = List.generate(
      80,
      (_) => GoldParticle.random(size.width, size.height, _random),
    );
    _initialized = true;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = Size(constraints.maxWidth, constraints.maxHeight);
        _initParticles(size);

        return RepaintBoundary(
          child: AnimatedBuilder(
            animation: widget.animationController,
            builder: (context, child) {
              return CustomPaint(
                size: size,
                painter: GoldParticlesPainter(
                  particles: _particles,
                  animationValue: widget.animationController.value,
                ),
              );
            },
          ),
        );
      },
    );
  }
}
