import * as Haptics from 'expo-haptics';

export const hapticService = {
  light() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* haptic not available */ }
  },

  medium() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* haptic not available */ }
  },

  heavy() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch { /* haptic not available */ }
  },

  success() {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { /* haptic not available */ }
  },

  error() {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch { /* haptic not available */ }
  },

  warning() {
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { /* haptic not available */ }
  },

  selection() {
    try { Haptics.selectionAsync(); } catch { /* haptic not available */ }
  },
};
