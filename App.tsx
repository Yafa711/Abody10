import 'react-native-reanimated';
import React, { useEffect, useCallback, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/themes/ThemeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { notificationService } from './src/services/notificationService';
import { errorService } from './src/services/errorService';
import { imageCacheService } from './src/services/imageService';
import { isOnline } from './src/services/networkService';

const CACHED_IMAGES = [
  'https://rjcqkwgjqeqwzfbedwav.supabase.co/storage/v1/object/public/banners/main-banner.jpg',
];

function NotificationInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
    notificationService.registerForPushNotifications().then(token => {
      if (token) {
        notificationService.savePushToken(user.id, token);
      }
    }).catch(err => {
      errorService.log(err, 'notification-init');
    });
  }, [user]);

  return <>{children}</>;
}

function ImagePrefetcher({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isOnline()) return;
    imageCacheService.prefetchBatch(CACHED_IMAGES).catch(() => {});
  }, []);

  return <>{children}</>;
}

function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  const handleError = useCallback((error: Error) => {
    errorService.capture(error, 'error', 'global');
  }, []);

  useEffect(() => {
    if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      if (ErrorUtils.setGlobalHandler) {
        ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
          handleError(error);
          if (originalHandler) originalHandler(error, isFatal);
        });
      }
      return () => {
        if (originalHandler && ErrorUtils.setGlobalHandler) {
          ErrorUtils.setGlobalHandler(originalHandler);
        }
      };
    }
    return undefined
  }, [handleError]);

  return <>{children}</>;
}

function ReanimatedRoot({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View style={{ flex: 1 }}>
      {children}
    </Animated.View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <GlobalErrorHandler>
              <ImagePrefetcher>
                <NotificationInitializer>
                  <CartProvider>
                    <ReanimatedRoot>
                      <RootNavigator />
                    </ReanimatedRoot>
                    <StatusBar
                        backgroundColor="#FFFFFF"
                        style="dark"
                      />
                  </CartProvider>
                </NotificationInitializer>
              </ImagePrefetcher>
            </GlobalErrorHandler>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
