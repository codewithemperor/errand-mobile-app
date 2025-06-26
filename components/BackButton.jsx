import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { router,  } from 'expo-router';

const BackButton = ({icon: IconComponent = false, color, text}) => {
  return (
     <TouchableOpacity onPress={() => router.back()} className='flex-row gap-x-2 items-center w-16 h-5 '>
        {IconComponent && (<View className="mt-1"><IconComponent width={18} height={18} color={color} /></View>)}
       <Text className='text-base font-SpaceGrotesk-Medium text-gray-950'>{text}</Text>
      </TouchableOpacity>
  )
}

export default BackButton;