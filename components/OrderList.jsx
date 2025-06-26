import { View, Text, Image } from 'react-native';
import React from 'react';
import { images } from "../constants";

const OrderList = ({
  restaurantName = "Iya Reruner Restaurant",
  serviceType = "Restaurant",
  itemAmount = "500.00",
  deliveryAmount = "500.00",
  totalAmount = "1000.00",
  status = "Pending",
  imageSource = images.onboarding1, // Default image if none is provided
}) => {
  // Determine the background color based on the status
  const statusBackgroundColor = status.toLowerCase() === "processing" ? "bg-primary" : "bg-secondary";
  const statusBorderColor = status.toLowerCase() === "success" ? "border-primary" : "border-secondary";

  return (
    <View className={`p-4 px-6 mb-4 border border-primary ${statusBorderColor} rounded-md`}>
      <View className='flex-row gap-x-3 items-center justify-between'>
        <View className='flex-1 flex-wrap'>
          <Text className='font-SpaceGrotesk-Semibold text-xl text-primary'>
            {restaurantName}
          </Text>
          <Text className='font-Raleway text-md'>
            Service Type: 
            <Text className='font-Raleway-Light text-md mt-1'> {serviceType}</Text>
          </Text>

          <View className='mt-2'>
            <Text className='font-Raleway text-md'>
              Item Amount: 
              <Text className='font-Raleway-Light'> ₦{itemAmount}</Text>
            </Text>

            <Text className='font-Raleway text-md'>
              Delivery Amount: 
              <Text className='font-Raleway-Light'> ₦{deliveryAmount}</Text>
            </Text>

            <Text className='font-Raleway text-md'>
              Total Amount: 
              <Text className='font-Raleway-Light'> ₦{totalAmount}</Text>
            </Text>
          </View>
        </View>

        <View className='items-center'>
          <Image
            source={imageSource}
            resizeMode="cover"
            className="rounded-lg"
            style={{ height: 70, width: 70 }}
          />
          <Text className={`font-Raleway-Bold text-white mt-2 ${statusBackgroundColor} p-1 px-3 rounded-md`}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OrderList;