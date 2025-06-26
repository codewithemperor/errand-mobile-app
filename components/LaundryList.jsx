import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { images } from "../constants";

const LaundryList = ({ containerStyle, onPress, image, deliveryPrice, availability = true, address, reviews, laundryName, laundryDecription }) => {
    return (
        <TouchableOpacity className={`mb-6 rounded-xl overflow-hidden border relative border-primary ${containerStyle} `} onPress={onPress}>
            <View className=" aspect-[2/1] w-full">
                <Image source={{ uri: `https://yourerrandsguy.com.ng/${image}` }} resizeMode="cover" className="w-full h-full" />
            </View>

            <View className="absolute flex flex-row bg-white p-2 rounded-md mt-2 left-3 top-0 gap-x-1">
                <Ionicons name="star-sharp" size={14} color="#fdcd11" />
                <Text className="font-SpaceGrotesk-Regular text-md">
                <Text className={`${availability ? "text-success" : "text-error"}`}>{availability ? "Available" : "Unavailable"}</Text>
                </Text>
            </View>

            <View className="p-4">
                <Text className="font-SpaceGrotesk-Bold text-primary text-2xl">{laundryName}</Text>
                <Text className="font-SpaceGrotesk-Regular mb-2">{laundryDecription}</Text>

                <View className="flex-row justify-between items-center mt-1">
                    <View className="flex-row gap-x-2">
                        <View className='flex-row gap-x-1'>
                            <Ionicons name="bicycle-sharp" size={14} color="#fdcd11" />
                            <Text className="font-SpaceGrotesk-Regular text-md">from ₦{deliveryPrice}</Text>
                        </View>
                        <View className='flex-row gap-x-1'>
                            <Ionicons name="location-sharp" size={14} color="#fdcd11" />
                            <Text className='font-Raleway-Extralight'> {address}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default LaundryList;
