/**
 * Native bridge utilities for iOS & Android via Capacitor.
 * Gracefully degrades to no-ops when running in browser.
 */

import { Capacitor } from '@capacitor/core'
import type { PluginListenerHandle } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'ios' | 'android' | 'web'

/**
 * Trigger haptic feedback on native devices.
 */
export async function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isNative) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }
    await Haptics.impact({ style: styleMap[style] })
  } catch {
    // Haptics not available on this device
  }
}

/**
 * Configure the native status bar to match the cosmic dark theme.
 * setBackgroundColor is Android-only; on iOS it is a no-op.
 */
export async function setStatusBarStyle() {
  if (!isNative) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    if (platform === 'android') {
      await StatusBar.setBackgroundColor({ color: '#020B18' })
    }
  } catch {
    // StatusBar plugin not available
  }
}

/**
 * Hide the native splash screen with a smooth fade.
 * Call this once your app UI is ready to display.
 */
export async function hideSplashScreen() {
  if (!isNative) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch {
    // SplashScreen plugin not available
  }
}

/**
 * Register the back-button handler for Android.
 * Prevents the app from closing on back press when on the dashboard.
 * Returns a cleanup function to remove the listener.
 */
export async function registerBackButton(
  onBackPress?: () => void,
): Promise<(() => void) | undefined> {
  if (!isNative || platform !== 'android') return undefined
  try {
    const { App } = await import('@capacitor/app')
    const handle: PluginListenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else if (onBackPress) {
        onBackPress()
      } else {
        App.minimizeApp()
      }
    })
    return () => {
      handle.remove()
    }
  } catch {
    // App plugin not available
    return undefined
  }
}

/**
 * Configure keyboard behavior for native platforms.
 * Hides the accessory bar on iOS and sets scroll behavior.
 */
export async function configureKeyboard(): Promise<(() => void) | undefined> {
  if (!isNative) return undefined
  try {
    const { Keyboard } = await import('@capacitor/keyboard')

    if (platform === 'ios') {
      await Keyboard.setAccessoryBarVisible({ isVisible: false })
      await Keyboard.setScroll({ isDisabled: false })
    }

    const showHandle = await Keyboard.addListener('keyboardWillShow', (info) => {
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
    })
    const hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px')
    })

    return () => {
      showHandle.remove()
      hideHandle.remove()
    }
  } catch {
    // Keyboard plugin not available
    return undefined
  }
}
