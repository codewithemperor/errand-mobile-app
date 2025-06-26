import { TouchableOpacity, View, Text } from 'react-native'
import React from 'react'

const CustomButton = ({ additionalStyles,  handlePress, title, containerStyles, textStyles, disabled, }) => {
  return (
    <TouchableOpacity 
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        className={`min-h-[40px] justify-center items-center rounded-lg ${containerStyles} ${disabled ? ' bg-primary-200' : ""}`}>
        
        
        <View className={`flex-row gap-x-2 ${additionalStyles} items-center justify-center`}>
            <Text className={` font-SpaceGrotesk-Bold text-[15px] ${textStyles}`}>{title}</Text>
        </View>
    </TouchableOpacity>
  )
}

export default CustomButton