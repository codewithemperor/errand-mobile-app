import { View, Text, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { images } from '../constants'
import { router, Redirect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';



import CustomButton from '../components/CustomButton'


export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    {
      image: images.onboarding1,
      title: 'Your Errand Guy',
      description: 'Swift, secure, and dependable delivery solutions nationwide, saving you time and effort',
    },
    {
      image: images.onboarding2,
      title: 'Food at Your Doorstep',
      description: 'Your Ready Order will get delivered quickly by our rider',
    },
    {
      image: images.onboarding3,
      title: 'Your location is all we need',
      description: 'Where are you? We’ll dispatch your order ASAP!',
    },
  ];

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("BearerToken");
      if (token) {
        setHasToken(true);
      }
      setLoading(false);
    };

    checkToken();
  }, []);

  console.log("Token:", hasToken)
  if (loading) {
    return null;
  }
  
  if (hasToken){
    return <Redirect href="/home" />;
  }
  
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(scrollPosition / slideWidth);
    setCurrentIndex(index);
  };
  
  
  let scrollViewRef = null;
  
  return (
    <SafeAreaView className="h-full w-full items-center justify-between bg-white">
    {/* <Redirect href="/home" /> */}
    <View className='flex-1 justify-center'>
      <View className='w-full'>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ref={(ref) => (scrollViewRef = ref)}
          
        >
          {slides.map((slide, index) => (
            <View key={index} className="w-[100vw]">
              <Image source={slide.image} resizeMode="contain" className="w-full h-min" />
              <View className="px-6 mt-6 mb-2">
                <Text className="font-Raleway-Black text-3xl text-center text-primary">{slide.title}</Text>
                <Text className="font-SpaceGrotesk-Regular text-base text-center px-10 text-gray-default mt-1">
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row justify-center mt-4">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`mx-1 h-2 rounded-full ${
                currentIndex === index ? 'bg-primary w-6' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </View>

      </View>
    </View>

    <View className="px-6 w-full mb-5">
    <CustomButton
      containerStyles="bg-primary "
      title="Create Account"
      textStyles="text-white"
      handlePress={() => router.replace('./register')}
    />
    <CustomButton
      containerStyles="bg-secondary mt-2"
      title="Login"
      textStyles="text-black"
      handlePress={() => router.replace('./login')}
    />
    </View>


    

    <StatusBar style='auto'/>
    </SafeAreaView>
  )
}

