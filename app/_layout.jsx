import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { GlobalCartProvider } from "../context/GlobalCartContext"; // Adjust path as needed
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { Toaster } from 'burnt/web';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    "Raleway-Black": require("../assets/fonts/Raleway-Black.ttf"),
    "Raleway-BlackItalic": require("../assets/fonts/Raleway-BlackItalic.ttf"),
    "Raleway-Bold": require("../assets/fonts/Raleway-Bold.ttf"),
    "Raleway-BoldItalic": require("../assets/fonts/Raleway-BoldItalic.ttf"),
    "Raleway-ExtraBold": require("../assets/fonts/Raleway-ExtraBold.ttf"),
    "Raleway-ExtraBoldItalic": require("../assets/fonts/Raleway-ExtraBoldItalic.ttf"),
    "Raleway-ExtraLight": require("../assets/fonts/Raleway-ExtraLight.ttf"),
    "Raleway-ExtraLightItalic": require("../assets/fonts/Raleway-ExtraLightItalic.ttf"),
    "Raleway-Light": require("../assets/fonts/Raleway-Light.ttf"),
    "Raleway-LightItalic": require("../assets/fonts/Raleway-LightItalic.ttf"),
    "Raleway-Medium": require("../assets/fonts/Raleway-Medium.ttf"),
    "Raleway-MediumItalic": require("../assets/fonts/Raleway-MediumItalic.ttf"),
    "Raleway-Regular": require("../assets/fonts/Raleway-Regular.ttf"),
    "Raleway-Italic": require("../assets/fonts/Raleway-Italic.ttf"), // Regular Italic
    "Raleway-SemiBold": require("../assets/fonts/Raleway-SemiBold.ttf"),
    "Raleway-SemiBoldItalic": require("../assets/fonts/Raleway-SemiBoldItalic.ttf"),
    "Raleway-Thin": require("../assets/fonts/Raleway-Thin.ttf"),
    "Raleway-ThinItalic": require("../assets/fonts/Raleway-ThinItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded || error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GlobalCartProvider>
        <AutocompleteDropdownContextProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(services)" options={{ headerShown: false }} />
          </Stack>
          
          <Toaster />
        </AutocompleteDropdownContextProvider>
      </GlobalCartProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;