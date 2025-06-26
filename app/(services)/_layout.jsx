import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'


const OtherScreenLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen name="restaurant" options={{title: 'Restaurant', headerShadowVisible: false}}/>
        <Stack.Screen name="single" options={{title: 'Restaurant', headerShadowVisible: false}}/>
        <Stack.Screen name="package" options={{title: 'Send a Package', headerShadowVisible: false,}}/>
        <Stack.Screen name="errand" options={{title: 'Send us an Errand', headerShadowVisible: false,}}/>        
        <Stack.Screen name="laundry" options={{title: 'Laundry',  headerShadowVisible: false,}}/>        
      </Stack>
    </>
  )
}

export default OtherScreenLayout