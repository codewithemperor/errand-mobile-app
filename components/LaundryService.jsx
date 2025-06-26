import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { images } from '../constants';

const LaundryService = ({ name, price, quantity, onQuantityChange, onDelete }) => {
  return (
    <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
      <Image source={images.laundryPic} className='rounded-lg me-4' style={{height: 40, width: 40}}/>
      <View className="flex-1">
        <Text className="font-Raleway-Medium text-base">{name}</Text>
        <Text className="font-SpaceGrotesk-Regular text-sm text-gray-500">
          ₦{(price || 0).toFixed(2)} {/* Add null check */}
        </Text>
      </View>
      
      <View className="flex-row items-center gap-3">
        <TouchableOpacity 
          onPress={() => onQuantityChange(quantity - 1)}
          className="bg-primary w-8 h-8 items-center justify-center rounded-lg"
        >
          <Text className="text-white text-lg">-</Text>
        </TouchableOpacity>
        
        <Text className="font-SpaceGrotesk-Medium text-base">{quantity}</Text>
        
        <TouchableOpacity 
          onPress={() => onQuantityChange(quantity + 1)}
          className="bg-primary w-8 h-8 items-center justify-center rounded-lg"
        >
          <Text className="text-white text-lg">+</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onDelete}
          className="ml-3"
        >
          <Text className="text-red-500 font-Raleway-Bold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LaundryService;