import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RestaurantCard = ({
  imageSource,
  restaurantName,
  deliveryPrice,
  availability,
  rating,
  reviews,
  onPress,
  containerStyle
}) => {
  return (
    <TouchableOpacity className={`mb-6 ${containerStyle} `} onPress={onPress}>
      <Image source={imageSource} resizeMode="cover" className="h-[150] w-[100%] rounded-lg" />
      <Text className="font-Raleway-Medium text-2xl mt-1">{restaurantName}</Text>
      <View className="flex-row justify-between items-center mt-1">
        <View className="flex-row gap-x-2">
          <Ionicons name="bicycle-sharp" size={14} color="#fdcd11" />
          <Text className="font-SpaceGrotesk-Regular text-md">
            from ₦{deliveryPrice} |{' '}
            <Text className={`${availability ? 'text-success' : 'text-error'}`}>
              {availability ? 'Available' : 'Unavailable'}
            </Text>
          </Text>
        </View>

        <View className="flex-row gap-x-1">
          <Ionicons name="star-sharp" size={14} color="#fdcd11" />
          <Text className="font-SpaceGrotesk-Regular text-md">
            {rating} ({reviews})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RestaurantCard;
