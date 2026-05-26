import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

let Notifications: any = null;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

try {
  if (Platform.OS !== 'web' && !(isExpoGo && isAndroid)) {
    Notifications = require('expo-notifications');
  } else {
    console.log('[Notifications] Running in Web or Android Expo Go. Native notifications are stubbed.');
  }
} catch (error) {
  console.warn('[Notifications] Failed to load expo-notifications:', error);
}

// Configure foreground handler if the library loaded successfully
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[Notifications] Failed to configure handler:', error);
  }
}

/**
 * Requests notification permissions and configures the default channel on Android.
 */
export async function registerForNotificationsAsync(): Promise<boolean> {
  if (!Notifications) {
    return false;
  }
  
  let granted = false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    granted = finalStatus === 'granted';

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#006e2f',
      });
    }
  } catch (error) {
    console.error('[Notifications] Error registering for permissions:', error);
  }
  return granted;
}

/**
 * Gets the unique Expo Push Notification token for standalone EAS / Push services.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) {
    return 'ExponentPushToken[mock_stubbed_notifications_disabled]';
  }
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('[Notifications] EAS projectId is missing from app config. Remote push notifications require an EAS Project ID.');
      // Return a formatted mock token indicating project ID is missing so that the UI testing remains fully functional
      return 'ExponentPushToken[mock_no_eas_project_id_in_app_json]';
    }
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error: any) {
    console.error('[Notifications] Failed to get Expo push token:', error);
    return 'ExponentPushToken[mock_failed_generating_token]';
  }
}

/**
 * Saves a registered Expo Push Token to the Supabase database.
 */
export async function savePushTokenToSupabase(token: string, userId: string): Promise<boolean> {
  if (!userId || userId.startsWith('mock_')) {
    return false;
  }
  try {
    // Optimization check: Skip write if token was already saved successfully during this session cache
    const cachedToken = await AsyncStorage.getItem(`last_saved_push_token_${userId}`);
    if (cachedToken === token) {
      console.log('[Notifications] Push token already registered on Supabase. Skipping redundant database write.');
      return true;
    }

    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({
        user_id: userId,
        expo_push_token: token,
      }, { onConflict: 'user_id,expo_push_token' });

    if (error) {
      console.warn('[Notifications] Error saving token to Supabase (table might not exist yet):', error.message);
      return false;
    }
    
    // Save to AsyncStorage cache to prevent future redundant writes
    await AsyncStorage.setItem(`last_saved_push_token_${userId}`, token);
    console.log('[Notifications] Push token upserted successfully to Supabase for user:', userId);
    return true;
  } catch (err) {
    console.warn('[Notifications] Exception thrown when saving token to Supabase:', err);
    return false;
  }
}

/**
 * Sends an instant local notification to the mobile device.
 */
export async function sendLocalNotification(title: string, body: string, data?: any) {
  if (!Notifications) {
    console.log(`[Instant Mobile Notification Preview] Title: "${title}", Body: "${body}"`);
    return;
  }
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  } catch (error) {
    console.error('[Notifications] Error sending local notification:', error);
  }
}

/**
 * Schedules a local reminder notification at a specific future Date.
 */
export async function scheduleLocalReminderNotification(
  title: string,
  body: string,
  date: Date,
  data?: any
): Promise<string | null> {
  if (!Notifications) {
    console.log(`[Scheduled Mobile Reminder Preview (at ${date.toISOString()})] Title: "${title}", Body: "${body}"`);
    return `mock_notification_id_${Date.now()}`;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: date,
    });
    console.log(`[Notifications] Local notification successfully scheduled for: ${date.toLocaleString()} (ID: ${id})`);
    return id;
  } catch (error) {
    console.error('[Notifications] Error scheduling local reminder notification:', error);
    return null;
  }
}

/**
 * Cancels a scheduled local notification.
 */
export async function cancelScheduledNotification(id: string) {
  if (!Notifications) {
    console.log(`[Cancel notification] ID: ${id}`);
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log('[Notifications] Canceled scheduled notification ID:', id);
  } catch (error) {
    console.error('[Notifications] Error canceling notification:', error);
  }
}

/**
 * Adds a listener for notification response clicks.
 */
export function addNotificationResponseListener(callback: (response: any) => void) {
  if (!Notifications) {
    return null;
  }
  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch (error) {
    console.error('[Notifications] Error adding response listener:', error);
    return null;
  }
}

/**
 * Schedules a notification to fire after a specified number of seconds.
 */
export async function scheduleNotificationAsync(title: string, body: string, seconds: number, data?: any) {
  if (!Notifications) {
    console.log(`[Scheduled Mobile Notification Preview (in ${seconds}s)] Title: "${title}", Body: "${body}"`);
    return;
  }
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      } as any,
    });
  } catch (error) {
    console.error('[Notifications] Error scheduling notification:', error);
  }
}
