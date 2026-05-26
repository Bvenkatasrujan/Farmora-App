import { Linking, Alert } from 'react-native';

export const openGoogleMapsSearch = (
  crop: string | null,
  mandal: string | null,
  district: string | null,
  state: string | null
) => {
  if (!crop || !mandal || !district || !state) {
    Alert.alert("Missing Selection", "Please select all fields");
    return;
  }

  const query = `${crop} wholesale market near ${mandal}, ${district}, ${state}`;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Google Maps cannot be opened on this device.");
      }
    })
    .catch((err) => {
      console.error("An error occurred opening Google Maps", err);
      // Fallback: try opening directly anyway
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open Google Maps link.");
      });
    });
};
