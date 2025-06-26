import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const LaundryCartCard = ({ cartItem, deleteFromCart }) => {
  return (
    <View className="flex-row items-stretch gap-x-3 border border-gray-borderDefault p-3 rounded-lg mb-4">
      <View className="h-[120] w-[40%]">
        <Image
          source={{ uri: cartItem.imageSource }}
          resizeMode="cover"
          className="h-full w-full rounded-lg"
        />
      </View>
      <View className="flex-1">
        <Text className="font-Raleway-Bold text-xl">{cartItem.laundry}</Text>
        <Text className="font-SpaceGrotesk-Regular text-sm">{cartItem.location}</Text>

        <View className="mt-3">
          {cartItem.items.map((item, i) => (
            <View key={i} className="flex-row justify-between">
              <Text className="font-Raleway-Medium text-sm flex-1">
                {item.name} (x{item.quantity})
              </Text>
              <Text className="font-SpaceGrotesk-Regular text-sm">
                ₦{(item.pricePerItem * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-[4]">
            <Text className="font-Raleway-SemiBold text-sm flex-1">Delivery to {`(${cartItem.deliveryFee.landmark})`}</Text>
            <Text className="font-SpaceGrotesk-Medium text-sm">
              ₦{cartItem.deliveryFee.price.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="bg-secondary-100 mt-4 p-2 rounded-lg flex-row justify-between items-center">
          <View>
            <Text className="text-xs">Total</Text>
            <Text className="font-SpaceGrotesk-Bold text-xl">
              ₦{cartItem.totalAmount}
            </Text>
          </View>

          <TouchableOpacity onPress={deleteFromCart}>
            <Ionicons name="trash" size={18} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LaundryCartCard;
