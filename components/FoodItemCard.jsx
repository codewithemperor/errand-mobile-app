import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import CustomButton from './CustomButton'; // Adjust the path to your CustomButton

const FoodItemCard = ({
  imageSource,
  name,
  description,
  price,
  onPress,
}) => {
  

  return (
    <>
      {/* Food Item Card */}
      <View className="p-2 border border-gray-100 rounded-lg w-[49%]">
        <Image source={imageSource} resizeMode="cover" className="h-[120] w-full rounded-md" style={{ height: 120, width: '100%'}}/>
        <View className="mt-2 flex-row justify-between items-center w-full">
          <Text className="font-Raleway-Bold text-xl flex-1">{name}</Text>
          <Text className="font-SpaceGrotesk-Bold text-secondary text-lg">₦{price}</Text>
        </View>
        <Text className="font-Raleway-Light">{description}</Text>
        <CustomButton
          title="Add"
          containerStyles="bg-primary mt-3"
          textStyles="text-white"
          handlePress={onPress}
        />
      </View>

      
    </>
  );
};

export default FoodItemCard;