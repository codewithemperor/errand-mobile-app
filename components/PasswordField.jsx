import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PasswordField = ({
    value, 
    otherStyles, 
    placeholder, 
    title, 
    editable,
    error,
    titleStyle,
    handleChangeText, 
    keyboardType, 
    maxLength,
    textInputBgStyles,
    textFocus}) => {

    const [secureEntryState, setSecureEntryState] = useState(true);
    const toggleSecureEntry = () => {
        setSecureEntryState(!secureEntryState);
    };
    return (
        <View className={`gap-y-1 ${otherStyles}`}>
    
            {title && <Text className={`text-base font-Raleway-SemiBold text-gray-textSubtitle ${titleStyle}`}>{title}</Text>}
    
            <View className={`w-full border h-[52] px-4 border-gray-borderDefault rounded-md items-center flex flex-row ${textInputBgStyles}`}>
            
            <TextInput 
                className="flex-1 text-base font-SpaceGrotesk-Medium text-gray-textTitle pr-3"
                placeholder={placeholder}
                value={value}
                placeholderTextColor="#c2c2c2"
                keyboardType={keyboardType}
                returnKeyType="done"
                selectionColor="#605d55"
                onChangeText={handleChangeText}
                onFocus={textFocus}  
                editable={editable}          
                secureTextEntry={secureEntryState}
                maxLength={maxLength}
            />
            <TouchableOpacity onPress={toggleSecureEntry} className="p-2 pr-0">
                <MaterialCommunityIcons
                name={secureEntryState ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="gray"
                />
            </TouchableOpacity>
            </View>
    
            {error && <Text className={`text-xs font-pRegular text-error-textLink`}>{error}</Text>}
        </View>
    )
}

export default PasswordField