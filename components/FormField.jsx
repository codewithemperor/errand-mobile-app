import { View, Text, TextInput } from 'react-native';
import React, { useState } from 'react';

const FormField = ({
  icon: IconComponent = false, 
  lefticon: LeftIconComponent = false, 
  value, 
  otherStyles, 
  placeholder, 
  color, 
  title, 
  editable = true, 
  error, 
  titleStyle, 
  handleChangeText, 
  keyboardType, 
  width, 
  textInputBgStyles, 
  textFocus, 
  height,
  autoCapitalize,
  maxLength,
  
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`gap-1 ${otherStyles}`}>
      {title && (
        <Text className={`text-base font-SpaceGrotesk-Semibold mb-1 text-gray-textSubtitle ${titleStyle}`}>
          {title}
        </Text>
      )}

      <View
        className={`h-[52] w-full border px-4 rounded-md items-center flex flex-row ${
          isFocused ? 'border-primary' : 'border-gray-borderDefault'
        } ${textInputBgStyles}`}
        
      >
        <View className="flex-row items-center flex-1 w-full">
          {LeftIconComponent && (
            <View className="mr-2">
              <LeftIconComponent width={width} height={height} color={color} />
            </View>
          )}

          <TextInput
            className="flex-1 text-base font-SpaceGrotesk-Medium text-gray-textTitle pr-3"
            placeholder={placeholder}
            value={value}
            placeholderTextColor="#c2c2c2"
            keyboardType={keyboardType}
            returnKeyType="done"
            selectionColor="#605d55"
            onChangeText={handleChangeText}
            onFocus={() => {
              setIsFocused(true);
              textFocus?.();
            }}
            onBlur={() => setIsFocused(false)}
            editable={editable}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
          
          />

          {IconComponent && <IconComponent width={20} height={20} color={color} />}
        </View>
      </View>

      {error && <Text className={`text-xs font-pRegular text-error-textLink`}>{error}</Text>}
    </View>
  );
};

export default FormField;
