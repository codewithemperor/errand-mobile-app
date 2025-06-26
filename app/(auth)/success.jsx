import React from 'react';
import { Image, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { images } from '../../constants';
import CustomButton from '../../components/CustomButton';


const Success = () => {
    return (
        <SafeAreaView className='h-full w-full bg-white'>
            <View className='flex-1 justify-center items-center'>
                
                <Image source={images.congratulation} resizeMode='contain' className="h-[40vh] w-[100vw]" />

                <View className='px-12 mt-9'>
                    <Text className='font-Raleway-Bold text-primary text-4xl text-center'>Congratulation!</Text>
                    <Text className='font-SpaceGrotesk-Regular text-base text-center mt-1'>Your account is complete, please enjoy best menu from us.</Text>
                </View>
            </View>
            

            <View className='px-6 my-3 '>
                <CustomButton
                  title="Get Started"
                  containerStyles="bg-primary"
                  textStyles="text-white"
                  handlePress={() => router.push('home')}
                />
              </View>
              <StatusBar style='dark' />
        </SafeAreaView>
    );
}


export default Success;