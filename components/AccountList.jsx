import { TouchableOpacity, View, Text } from 'react-native'
import React from 'react'


const AccountList = ({title, containerStyle, icon: IconName, name, size, color, handlePress, iconBg}) => {
  return (
    <TouchableOpacity className={`flex-row ${containerStyle} items-center py-4`} activeOpacity={0.5} onPress={handlePress}>
        <View className={`h-8 w-10 items-center justify-center rounded-full`} style={{backgroundColor: iconBg}}>
            <IconName name={name} size={size} color={color}/>
        </View>
        <Text className="ml-4 text-xl font-Raleway-SemiBold">{title}</Text>
  </TouchableOpacity>
  )
}

export default AccountList