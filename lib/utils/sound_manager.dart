import 'package:flutter/foundation.dart';
import 'package:audioplayers/audioplayers.dart';

/// 🔊 Single Audio Player SoundManager for ZERONYX Splash Screen
class SoundManager {
  static final SoundManager _instance = SoundManager._internal();
  factory SoundManager() => _instance;
  SoundManager._internal();

  final AudioPlayer _player = AudioPlayer();
  bool _isMuted = false;
  bool _isPreloaded = false;
  bool _isPlaying = false;

  bool get isMuted => _isMuted;
  bool get isPlaying => _isPlaying;

  void toggleMute() {
    _isMuted = !_isMuted;
    if (_isMuted) {
      _player.setVolume(0.0);
    } else {
      _player.setVolume(0.8);
    }
  }

  /// Preload single full splash sound in main() / initState
  Future<void> preloadSplashSound() async {
    if (_isPreloaded) return;
    try {
      await _player.setReleaseMode(ReleaseMode.stop);
      await _player.setSource(AssetSource('sounds/zeronyx_full_splash_sound.mp3'));
      _isPreloaded = true;
    } catch (e) {
      if (kDebugMode) {
        print("[SoundManager] Preload notice: $e");
      }
    }
  }

  /// Play full splash sound immediately on app launch (t = 0 sec)
  Future<void> playFullSplashSound() async {
    if (_isMuted) return;
    try {
      await _player.stop();
      await _player.setReleaseMode(ReleaseMode.stop);
      await _player.setVolume(0.8);
      await _player.play(AssetSource('sounds/zeronyx_full_splash_sound.mp3'));
      _isPlaying = true;
    } catch (e) {
      if (kDebugMode) {
        print("[SoundManager] Playback warning (silent mode / web autoplay policy): $e");
      }
    }
  }

  void dispose() {
    _player.dispose();
  }
}
