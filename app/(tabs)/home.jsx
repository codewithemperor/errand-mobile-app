import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Burnt from 'burnt';
import axios from 'axios';
import '../../global.css'

import ServiceGrid from '../../components/ServiceGrid'
import { icons, images } from '../../constants';
import RestaurantIcon from '../../assets/icons/restaurantIcon';
import LaundryIcon from '../../assets/icons/laundryIcon';
import ErrandIcon from '../../assets/icons/errandIcon';
import PackageIcon from '../../assets/icons/packageIcon';
import RestaurantCard from '../../components/RestaurantCard';


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


const Home = () => {
  const [fullName, setFullName] = useState('');
  const [popular, setPopular] = useState([]);
  const services = [
    {
      title: 'Restaurant',
      bgColor: 'bg-lime-100',
      icon: <RestaurantIcon width={90} height={90} />,
      onPress: () => router.push('restaurant'),
    },
    {
      title: 'Laundry',
      bgColor: 'bg-red-100',
      icon: <LaundryIcon width={90} height={90} />,
      onPress: () => router.push('laundry'),
    },
    {
      title: 'Package',
      bgColor: 'bg-blue-100',
      icon: <PackageIcon width={90} height={90} />,
      onPress: () => router.push('package'),
    },
    {
      title: 'Errand',
      bgColor: 'bg-orange-100',
      icon: <ErrandIcon width={90} height={90} />,
      onPress: () => router.push('errand'),
    },
  ];

  const loadData = async () => {
    const userString = await AsyncStorage.getItem('user');
    const storedPopular = await AsyncStorage.getItem('popular');

    const user = userString ? JSON.parse(userString) : null;
    const popular = storedPopular ? JSON.parse(storedPopular) : null;

    if (user) setFullName(user.fullname);
    if (popular) setPopular(popular);
  };

  
  const getHome = async () => {
    try {
      
      const token = await AsyncStorage.getItem('BearerToken');

      const response = await axios.get(`${API_BASE_URL}dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) { 
        
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        await AsyncStorage.setItem('popular', JSON.stringify(response.data.data.popular));
        await AsyncStorage.setItem('vendors', JSON.stringify(response.data.data.vendors));
        await AsyncStorage.setItem('laundries', JSON.stringify(response.data.data.laundries));

        await loadData();

      }

    } catch (error) {
      console.error('Error fetching history:', error);
      Burnt.toast({
        title: 'Failed to fetch orders!',
        preset: 'error',
        from: 'top',
      });
    } 
  };

  useEffect(() => {
    loadData();
  }, []);



  useFocusEffect(
    React.useCallback(() => {
      getHome();
    }, [])
  );


  return (
    <SafeAreaView className='h-full w-full bg- pt-6 bg-white'>
        <ScrollView className='flex-1 w-full h-full'>

            <View className='px-6'>
                <View className='flex-row items-center mt-3 gap-x-2'>
                    <View className='overflow-hidden rounded-full'>
                        <Image source={images.avatar} resizeMode='cover' className='bg-primary-100' style={{ height: 50, width: 50,}}  />
                    </View>
                    <View className=''>
                        <Text className='text-sm font-SpaceGrotesk-Medium text-dark '>Welcome Back!</Text>
                        <Text className='text-2xl font-Raleway-Bold text-dark '>{fullName}</Text>
                    </View>
                </View>

                {/* <View className='border mt-6 flex-1 h-[45] rounded-lg border-gray-textNegative flex-row items-center px-2'>
                    <Ionicons name="search-sharp" size={20} color="#fdfdfd" />
                    <TextInput 
                        className="flex-1 text-base font-SpaceGrotesk-Medium text-white pr-3"
                        placeholder="Search for a errand"
                        placeholderTextColor="#fdfdfd"
                        autoCapitalize="none"
                    />
                </View> */}
            </View>

            <View className='px-6 mt-6 overflow-hidden rounded-xl'>
                <Image source={images.advert} resizeMode='cover' className='rounded-xl'  style={{ width: '100%',}}/>
            </View>

            <View className='px-6 mt-6'>
              <ServiceGrid services={services} />
            </View>
            
            <View className='px-6'>
                <View className='mt-6'>
                    <Text className='font-Raleway-Bold text-2xl mb-2'>Common Restaurant</Text>
                    {popular.map((restaurant) => (
                      <RestaurantCard 
                      key={restaurant.id}
                      imageSource={{ uri: `https://yourerrandsguy.com.ng/${restaurant.image}` } || images.onboarding2} 
                      restaurantName={restaurant.name}
                      deliveryPrice={
                        Array.isArray(restaurant.deliveryfee) && restaurant.deliveryfee.length > 0
                          ? restaurant.deliveryfee[0].price
                          : 'N/A'
                      }
                      availability={true} 
                      rating={4.0} 
                      reviews={83} 
                      onPress={() => {
                        router.push({ 
                          pathname: 'single', 
                          params: { 
                            vendorId: restaurant.id, 
                            vendorName: restaurant.name, 
                            vendorAddress: restaurant.address, 
                            vendorImage: restaurant.image,
                            deliveryfee: JSON.stringify(restaurant.deliveryfee),
                            foodItems: JSON.stringify(restaurant.items) 
                          } 
                        }); 
                      }}
                    />

                    ))}
                </View>
            </View>

            <View className='px-6 mb-8 overflow-hidden rounded-xl'>
                <Image source={images.advert} resizeMode='cover' className='rounded-xl'  style={{ width: '100%',}}/>
            </View>
            


        </ScrollView>
        <StatusBar style='dark' />
    
    </SafeAreaView>
  )
}

export default Home