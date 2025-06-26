import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, ScrollView, Text, TouchableOpacity, Image, Modal, Alert } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";

import { images } from "../../constants";
import { useGlobalCart } from "../../context/GlobalCartContext";
import CustomDropdown from '../../components/CustomDropdown'; 
import FoodItemCard from "../../components/FoodItemCard";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";

const FoodList = () => {
  const [counter, setCounter] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const cartSnapPoints = useMemo(() => ["70%"], []);

  const handleOpenBottomSheet = useCallback((item) => {
    setSelectedItem(item); // Set the selected item
    bottomSheetRef.current?.expand(); // Open the bottom sheet
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close(); // Close the bottom sheet
    setCounter(1); // Reset the counter
    setSelectedItem(null); // Clear the selected item
    setIsCartVisible(false);
  }, []);

  // Open the BottomSheet for the cart
  const handleOpenCartSheet = () => {
    setIsCartVisible(true);
    bottomSheetRef.current?.expand();
  };

  const handleIncrease = () => setCounter(counter + 1);
  const handleDecrease = () => {
    if (counter > 1) setCounter(counter - 1);
  };

  const params = useLocalSearchParams();
  const { vendorId, vendorName, foodItems: foodItemsString, vendorAddress, deliveryfee: deliveryfeeString, vendorImage } = params;
  const foodItems = foodItemsString ? JSON.parse(foodItemsString) : [];
  const deliveryDetails = deliveryfeeString ? JSON.parse(deliveryfeeString) : [];

  const [useUserInfo, setUseUserInfo] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const { addToGlobalCart } = useGlobalCart();
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
  });

  

  

  const handleCheckboxPress = async () => {
    const newUseUserInfo = !useUserInfo; // Toggle the state
    setUseUserInfo(newUseUserInfo);

    if (newUseUserInfo) {
      // If toggled on, fetch user data and update form fields
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          setFormData((prev) => ({
            ...prev,
            receiverName: user.fullname || '',
            receiverPhone: user.phone.startsWith('0') ? user.phone : `0${user.phone}`,
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    } else {
      // If toggled off, reset the form fields to empty strings
      setFormData((prev) => ({
        ...prev,
        receiverName: '',
        receiverPhone: '',
      }));
    }
  };

  // Validation functions inside useEffect
  useEffect(() => {
    const newErrors = {};
    const validatePhone = (number) => /^(0(70|71|80|81|90|91))\d{8}$/.test(number);

    if (formData.receiverName.length > 1 && formData.receiverName.length <= 3) {
      newErrors.receiverName = 'Name must be greater than 3 characters';
    }

    if (formData.receiverPhone.length > 1) {
      if (formData.receiverPhone.length !== 11) {
        newErrors.receiverPhone = 'Phone must be 11 digits';
      } else if (!validatePhone(formData.receiverPhone)) {
        newErrors.receiverPhone = 'Invalid Nigerian phone number';
      }
    }

    if (formData.receiverEmail.length > 1 && !formData.receiverEmail) {
      newErrors.receiverEmail = 'Delivery Address is required';
    }

    if (!selectedDelivery) {
      newErrors.delivery = 'Please select delivery area';
      }

    const isValid = 
      formData.receiverName.length > 3 &&
      formData.receiverPhone.length === 11 &&
      validatePhone(formData.receiverPhone) &&
      selectedDelivery && 
      formData.receiverEmail && 
      cartItems.length > 0;

    setErrors(newErrors);
    setIsFormComplete(!isValid);

  }, [formData, cartItems, selectedDelivery]);

  const handleAddToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.name === item.name);
      if (existingItem) {
        return prevItems.map((cartItem) => (cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
      }
      return [...prevItems, { ...item, quantity: counter }];
    });
  };

  const handleDeleteItem = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };
  
  const deliveryFee = selectedDelivery ? parseFloat(selectedDelivery.price) : 0;
  const itemAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount =  itemAmount + deliveryFee;

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      console.log(e.data.action.payload); // Debug log

      // Check if payload exists and has a name property
      if (cartItems.length > 0 && (!e.data.action.payload || e.data.action.payload.name !== "(tabs)")) {
        e.preventDefault(); // Prevent navigation

        Alert.alert("Warning", "Your cart will be emptied if you leave this page. Do you want to proceed?", [
          {
            text: "Cancel",
            onPress: () => {}, // Do nothing
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              setCartItems([]); // Clear the cart
              navigation.dispatch(e.data.action); // Proceed with navigation
            },
          },
        ]);
      }
    });

    return unsubscribe; // Cleanup the listener
  }, [cartItems, navigation]);

  const proceedToGlobalCart = () => {
    const deliveryDetails = selectedDelivery
      ? {
          landmark: selectedDelivery.landmark,
          price: parseFloat(selectedDelivery.price),
          vendor_id: selectedDelivery.vendor_id,
          id: selectedDelivery.id,
        }
      : null;

    const globalCartItem = {
      services: "Restaurant",
      restaurant: vendorName,
      restaurant_id: vendorId,
      location: vendorAddress,
      items: cartItems,
      formDetails: formData,
      itemAmount,
      totalAmount,
      deliveryFee: deliveryDetails,
      imageSource: `https://yourerrandsguy.com.ng/${vendorImage}`,
    };
    console.log(globalCartItem);
    addToGlobalCart(globalCartItem);
    setCartItems([]);
    setIsCartVisible(false);
    router.replace("cart");
  };

  return (
    <View className="bg-white h-full flex-1">
      <View className="flex-row justify-between items-center mb-6 bg-secondary  p-3 mt-4 px-6">
        <View>
          <Text className="font-Raleway-Bold text-2xl mt-1">{vendorName}</Text>
          <Text className="font-SpaceGrotesk-Regular text-md mt-1">{vendorAddress}</Text>
        </View>

        {cartItems.length > 0 && (
          <TouchableOpacity className="bg-primary rounded-full p-4 relative" onPress={handleOpenCartSheet} disabled={cartItems.length === 0}>
            <AntDesign name="shoppingcart" size={24} color="white" />
              <View className="absolute bg-black rounded-full h-[20] w-[20] top-0 end-0 items-center justify-center">
                <Text className="font-SpaceGrotesk-Regular text-sm text-white">{cartItems.length}</Text>
              </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="px-6 flex-1 ">
        <View className="h-full flex-row bg-white flex-wrap justify-between w-full gap-y-5">
          {foodItems.map((item) => (
            <FoodItemCard 
            key={item.id}
            imageSource={{ uri: `https://yourerrandsguy.com.ng/${item.image}` } || images.food}
            name={item.name}
            description={item.description}
            price={item.price}
            onPress={() => handleOpenBottomSheet(item)}
          />

          ))}
        </View>
      </ScrollView>

      {selectedItem && (
        <BlurView intensity={30} tint="systemThinMaterial" experimentalBlurMethod="dimezisBlurView" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            onClose={handleCloseBottomSheet}
            backgroundComponent={({ style }) => <View className="bg-white rounded-t-3xl" style={style} />}
            handleComponent={() => (
              <View className="pt-3 pb-3">
                <View className="w-12 h-1 bg-primary rounded-full self-center" />
              </View>
            )}
          >
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            >
              <View className="flex-1 px-6">
                {/* Bottom Sheet Content */}
                <Image source={{ uri: `https://yourerrandsguy.com.ng/${selectedItem.image}` } || images.food} resizeMode="cover" className="h-[130] w-full rounded-md" />
                <Text className="font-Raleway-Bold text-2xl mt-4">{selectedItem.name}</Text>
                <Text className="font-Raleway-Light mt-2">{selectedItem.description}</Text>
                <Text className="font-SpaceGrotesk-Bold text-secondary text-lg mt-2">₦{selectedItem.price}</Text>

                <View className="flex-row justify-between items-center mt-4 mb-5">
                  {/* Counter */}
                  <View className="flex-row items-center border border-gray-300 rounded-md">
                    <TouchableOpacity onPress={handleDecrease} className="px-3 py-2">
                      <Text className="text-lg font-bold">-</Text>
                    </TouchableOpacity>
                    <Text className="px-4 py-2 text-lg font-SpaceGrotesk-Semibold">{counter}</Text>
                    <TouchableOpacity onPress={handleIncrease} className="px-3 py-2">
                      <Text className="text-lg font-bold">+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Add to Cart Button */}
                  <CustomButton
                    title={`Add ₦${(selectedItem.price * counter).toFixed(2)}`}
                    containerStyles="bg-primary px-4"
                    textStyles="text-white"
                    handlePress={() => {
                      handleAddToCart({
                        name: selectedItem.name,
                        price: selectedItem.price,
                        quantity: counter,
                      });
                      handleCloseBottomSheet();
                    }}
                  />
                </View>
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </BlurView>
      )}

      {isCartVisible && (
        <BlurView intensity={30} tint="systemThinMaterial" experimentalBlurMethod="dimezisBlurView" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={cartSnapPoints}
            enablePanDownToClose={true}
            onChange={(index) => {
              if (index === -1) {
                setIsCartVisible(false);
              }
            }}
            backgroundComponent={({ style }) => <View className="bg-white rounded-t-3xl" style={style} />}
            handleComponent={() => (
              <View className="pt-3 pb-3">
                <View className="w-12 h-1 bg-primary rounded-full self-center" />
              </View>
            )}
          >
            <BottomSheetScrollView
              contentContainerStyle={{
                paddingBottom: 10,
              }}
            >
              <View className="flex-1 justify-end">
                <View className="bg-black flex-1 opacity-50" />
                <View className="bg-white rounded-t-lg p-4">
                  <Text className="font-Raleway-Bold text-2xl my-5">Cart</Text>
                  {cartItems.map((item, index) => (
                    <View key={index} className="flex-row gap-x-4 border-b mb-4 pb-4 border-gray-borderDefault">
                      <Text className="font-Raleway-Medium text-md flex-1">
                        {item.name} (x{item.quantity})
                      </Text>
                      <Text className="font-SpaceGrotesk-Semibold text-primary-400 text-md">₦{item.price * item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleDeleteItem(index)}>
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <Text className="font-Raleway-Bold text-2xl mt-10 mb-4">Receiver Information</Text>

                  <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={handleCheckboxPress}>
                      <AntDesign name={useUserInfo ? "checkcircle" : "checkcircleo"} size={24} color={useUserInfo ? "green" : "gray"} />
                    </TouchableOpacity>
                    <Text className="ml-2 font-SpaceGrotesk-Medium">Use my information</Text>
                  </View>

                  <View className="flex-wrap flex-row w-full justify-between">
                    <FormField 
                      title="Name" 
                      placeholder="Adebola Ibrahim Nneka" 
                      otherStyles="mt-4 w-[49%]" 
                      handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverName: value }))}
                      value={formData.receiverName} 
                    />

                    <FormField
                      title="Phone Number"
                      placeholder="08000000000"
                      otherStyles="mt-4 w-[49%]"
                      keyboardType="phone-pad"
                      handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverPhone: value }))}
                      value={formData.receiverPhone}
                      error={errors.receiverPhone}
                    />

                    <FormField
                      title="Delivery Address"
                      placeholder="Delivery Address"
                      otherStyles="mt-4 w-full"
                      handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverEmail: value }))}
                      value={formData.receiverEmail}
                      error={errors.receiverEmail}
                    />

                    <View className="w-full mt-4">
                      <CustomDropdown
                        title="Delivery Landmark"
                        placeholder="Select Delivery Area"
                        dataSet={deliveryDetails.map((fee) => ({
                          id: fee.id,
                          title: `${fee.landmark} - ₦${fee.price}`,
                          ...fee,
                        }))}
                        onSelectItem={setSelectedDelivery}
                        error={errors.delivery}
                      />
                    </View>
                  </View>

                  <View className="bg-secondary-400 rounded-lg mt-4 p-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-SpaceGrotesk-Medium text-md flex-1">Item Amount</Text>
                      <Text className="font-SpaceGrotesk-Medium text-md">₦{itemAmount.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="font-SpaceGrotesk-Medium text-md flex-1">Delivery Fee</Text>
                      <Text className="font-SpaceGrotesk-Medium text-md">₦{deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="font-SpaceGrotesk-Bold text-lg flex-1">Total Amount</Text>
                      <Text className="font-SpaceGrotesk-Bold text-lg">₦{totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <CustomButton title="Proceed" containerStyles="bg-primary mt-5 w-[75%]" textStyles="text-white" handlePress={proceedToGlobalCart} disabled={isFormComplete} />

                    <CustomButton title="Close" containerStyles="bg-gray-300 rounded-lg mt-4 p-4 flex-1" textStyles="" handlePress={() => setIsCartVisible(false)} />
                  </View>
                </View>
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </BlurView>
      )}
    </View>
  );
};

export default FoodList;


