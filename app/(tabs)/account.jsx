import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FontAwesome5, AntDesign, MaterialIcons,  } from '@expo/vector-icons'
import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalCart } from "../../context/GlobalCartContext";
import * as Burnt from 'burnt'; 

import AccountList from '../../components/AccountList';
import { router } from 'expo-router';
import { images } from '../../constants';
import FormField from '../../components/FormField';




const getUserData = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    const user = JSON.parse(userString);
    return user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};
const Account = () => {
  const { clearGlobalCart } = useGlobalCart();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({})

  useEffect(() => {
    const loadUserData = async () => {
      const user = await getUserData();
      if (user) {
        setPersonalDetails(user);
      }
    };
    loadUserData();
  }, []);
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      clearGlobalCart();
      await Burnt.toast({
        title: 'Logged out successfully.',
        preset: 'success',
        from: 'top',
      });
      router.replace('/login'); 
    } catch (error) {
      console.error('Error during logout:', error);
      await Burnt.toast({
        title: 'Failed to log out. Please try again.',
        preset: 'error',
        from: 'top',
      });
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      <ScrollView className=''>
      
      {/* Profile Section */}
      <View className="items-center mt-3 pt-10">
      <View className="pt-4 px-1.5 bg-primary-100 ">
        <Image
          source={images.avatar}
          style={{height: 100, width: 100}}
        />
      </View>

        <Text className="text-xl font-SpaceGrotesk-Semibold mt-4">{personalDetails.fullname || 'Guest User'}</Text>
      
      </View>

      <View className="my-8 px-6">
        
        <View className="bg-white p-6 rounded-lg mb-6 shadow-xl">

          <AccountList 
            title="Profile details"
            icon={Octicons} 
            name="person"
            size={16}
            iconBg="#4A90E2"  // Blue
            color="white"
            handlePress={() => setIsModalVisible(true)}
            // containerStyle="mb-2"
          />

          {/* <AccountList 
            title="Addresses"
            icon={Entypo} 
            name="map"
            size={14}
            color="white"
            iconBg="#D0021B"  // Red
            handlePress={() => router.push('/profileDetails')}
          /> */}

        </View>

        <View className="bg-white p-6 rounded-lg mb-6 shadow-xl">
  
          <AccountList 
            title="Cart"
            icon={MaterialIcons} 
            name="add-shopping-cart"
            size={16}
            color="white"
            iconBg="#F5A623"  // Orange
            handlePress={() => router.push('/cart')}
            containerStyle="mb-2"
          />

          <AccountList 
            title="History"
            icon={FontAwesome5} 
            name="history"
            size={14}
            color="white"
            iconBg="#7ED321"  // Green
            handlePress={() => router.push('/delivery')}
          />
        </View>

        {/* Logout */}
        <View className="bg-white p-6 rounded-lg shadow-xl">
          <AccountList 
            icon={MaterialIcons} 
            title="Logout"
            name="logout"
            size={14}
            iconBg="#9013FE"  // Purple
            color="white"
            handlePress={handleLogout}
          />
        </View>

      </View>


      </ScrollView>
      {isModalVisible && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 justify-center items-center">

          <View className='bg-white rounded-lg w-[90%] p-5 py-10'>
            <View className='flex-row justify-between space-x-4 items-center mb-8'>
              <View className='flex-1'>
                <Text className="font-SpaceGrotesk-Semibold text-primary text-2xl lh">Personal Details</Text>
                <Text className="font-Raleway-Light text-md ">View your personal details, including your name etc</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  
                  <AntDesign name="closecircleo" size={24} color="#ff0000" />
              </TouchableOpacity>
            </View>

            <FormField 
                title="Full Name"
                value={personalDetails.fullname}
                titleStyle="text-base"
                otherStyles="mb-7"
                textInputBgStyles="bg-gray-100"
                editable={false}
            />

              <FormField 
                  title="Email Address"
                  value={personalDetails.email}
                  titleStyle="text-base"
                  otherStyles="mb-7"
                  textInputBgStyles="bg-gray-100"
                  editable={false}
              />

              <View className='flex-row space-x-2 mb-7'>
                <FormField 
                    title="Phone Number"
                    value={personalDetails.phone}
                    titleStyle="text-base"
                    otherStyles="basis-1/2 mr-2"
                    textInputBgStyles="bg-gray-100"
                    editable={false}
                />

                <FormField 
                    title="Date of Birth"
                    value={personalDetails.dob}
                    titleStyle="text-base"
                    otherStyles="flex-1"
                    textInputBgStyles="bg-gray-100"
                    editable={false}

                />
              </View>
          </View>

              
                
          </View>
        )}
    </SafeAreaView>
  )
}

export default Account