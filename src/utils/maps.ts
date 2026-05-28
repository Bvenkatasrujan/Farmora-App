import { Linking, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export type MapSearchCategory = 'markets' | 'mills' | 'shops';

const openURLWithFallback = async (urls: string[]): Promise<boolean> => {
  for (const url of urls) {
    try {
      console.log("Attempting to open URL:", url);
      if (Platform.OS !== 'web' && (url.startsWith('http://') || url.startsWith('https://'))) {
        // Open web links in a premium in-app browser tab on native devices
        const result = await WebBrowser.openBrowserAsync(url);
        // If it opened or was dismissed, we consider it a success
        if (result && (result.type === 'opened' || result.type === 'dismiss' || result.type === 'cancel')) {
          return true;
        }
      } else {
        await Linking.openURL(url);
        return true;
      }
    } catch (err) {
      console.log(`Failed to open URL ${url}:`, err);
    }
  }
  return false;
};

export const openGoogleMapsSearch = async (
  crop: string | null,
  mandal: string | null,
  district: string | null,
  state: string | null,
  category: MapSearchCategory = 'markets'
) => {
  if (!crop || !mandal || !district || !state) {
    Alert.alert("Missing Selection", "Please select all fields");
    return;
  }

  let query = '';
  switch (category) {
    case 'mills':
      query = `${crop} processing mill OR rice mill OR flour mill OR oil mill near ${mandal}, ${district}, ${state}`;
      break;
    case 'shops':
      query = `${crop} wholesale shop OR trader near ${mandal}, ${district}, ${state}`;
      break;
    case 'markets':
    default:
      query = `${crop} wholesale market OR mandi near ${mandal}, ${district}, ${state}`;
      break;
  }

  const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (Platform.OS === 'web') {
    try {
      window.open(webUrl, '_blank');
    } catch (err) {
      console.error("Failed to open Google Maps on web via window.open:", err);
      const success = await openURLWithFallback([webUrl]);
      if (!success) {
        Alert.alert("Error", "Could not open Google Maps link.");
      }
    }
    return;
  }

  let success = false;
  if (Platform.OS === 'android') {
    const androidGeoUrl = `geo:0,0?q=${encodeURIComponent(query)}`;
    success = await openURLWithFallback([androidGeoUrl, webUrl]);
  } else if (Platform.OS === 'ios') {
    const iosGoogleMapsUrl = `comgooglemaps://?q=${encodeURIComponent(query)}`;
    const iosAppleMapsUrl = `maps://0,0?q=${encodeURIComponent(query)}`;
    success = await openURLWithFallback([iosGoogleMapsUrl, iosAppleMapsUrl, webUrl]);
  } else {
    success = await openURLWithFallback([webUrl]);
  }

  if (!success) {
    Alert.alert(
      "Error",
      "Could not open Google Maps. Please ensure a web browser or map application is installed."
    );
  }
};
