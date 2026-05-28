import { Linking, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/**
 * Opens a web URL safely in the browser on Web, or in a premium Custom Tab / Safari View Controller on iOS and Android.
 */
export const openWebLink = async (url: string) => {
  try {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (err) {
    console.error(`Failed to open web link ${url} via WebBrowser:`, err);
    try {
      await Linking.openURL(url);
    } catch (linkErr) {
      console.error(`Failed fallback Linking.openURL for ${url}:`, linkErr);
      Alert.alert('Error', 'Unable to open link on this device.');
    }
  }
};
