// Haptic Vibration Feedback Utility for Android / Pixel 10 Chrome

/**
 * Short subtle vibration pulse on counter tap (+1 increment)
 */
export function vibrateTap() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(25);
    } catch (e) {
      // Haptics not allowed or unsupported on current device
    }
  }
}

/**
 * Distinct double-pulse vibration on long-press action sheet trigger
 */
export function vibrateLongPress() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 30, 40]);
    } catch (e) {
      // Ignore fallback
    }
  }
}
