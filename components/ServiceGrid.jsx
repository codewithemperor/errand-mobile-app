import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

const ServiceGrid = ({ services }) => {
  return (
    <View className='flex-row flex-wrap justify-between gap-y-4'>
      {services.map((service, index) => (
        <TouchableOpacity
          key={index}
          className={`p-5 w-[48%] gap-3 ${service.bgColor} rounded-md items-center`}
          onPress={service.onPress}
        >
          {service.icon}
          <Text className='font-SpaceGrotesk-Bold text-xl'>{service.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ServiceGrid;