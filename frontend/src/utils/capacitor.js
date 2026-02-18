/**
 * Capacitor Platform Detection
 * Prüft, ob die App in einem nativen Container (iOS/Android) läuft.
 */
let _isNative = null;

export function isNativePlatform() {
  if (_isNative !== null) return _isNative;
  try {
    if (typeof window === 'undefined') {
      _isNative = false;
      return _isNative;
    }
    const cap = window.Capacitor ?? window.capacitor;
    _isNative = !!(cap && (cap.isNativePlatform?.() ?? cap.getPlatform?.() !== 'web'));
  } catch {
    _isNative = false;
  }
  return _isNative;
}
