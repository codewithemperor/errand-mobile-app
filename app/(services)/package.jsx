import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from "react";
import { AntDesign, Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { router } from "expo-router";

import { useGlobalCart } from "../../context/GlobalCartContext";
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton';
import CustomDropdown from "../../components/CustomDropdown";
import Loading from "../../components/Loading";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

const Package = () => {
    const { addToGlobalCart } = useGlobalCart();

    const [formData, setFormData] = useState({
        errandLocation: '',
        dropoffLocation: '',
        senderPhone: '',
        senderName: '',
        // senderEmail: '',
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        selectedErrandArea: null,
        selectedDropOffArea: null,
    });

    const dropoffInputRef = useRef(null); 
    const [loading, setLoading] = useState(false);
    const [pickUpLoading, setpickUpLoading] = useState(false);
    const [dropOffLoading, setdropOffLoading] = useState(false);
    
    const [pickupLandmark, setPickUpLandmark] = useState([]);
    const [dropOffLandmark, setDropOffLandmark] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [useInsurance, setUseInsurance] = useState(false);
    const [errors, setErrors] = useState({});
    const [itemAmount, setItemAmount] = useState(0);
    const [isFormComplete, setIsFormComplete] = useState(false); 
    const [deliveryFee, setdeliveryFee] = useState();
    const totalAmount = itemAmount + parseFloat(deliveryFee);

    const getPickupLandmark = async () => {
        try {
            setpickUpLoading(true);

            const token = await AsyncStorage.getItem('BearerToken');
            const response = await axios.get(`${API_BASE_URL}pickup-locations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.status)

            if (response.status === 200) {
                setPickUpLandmark(response.data.data)
                console.log(response.data.data)
            }
        } catch (e) {
            console.log('Error fetching', e)
        } finally {
            setpickUpLoading(false);
        }
    }

    const getDropLandmark = async () => {
        try {
            setdropOffLoading(true);
            console.log('A', formData.selectedErrandArea)
            const token = await AsyncStorage.getItem('BearerToken');
            const response = await axios.get(`${API_BASE_URL}dropoff-locations/${formData.selectedErrandArea.title}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Drop off:", response.status)

            if (response.status === 200) {
                setDropOffLandmark(response.data.data)
                console.log("Drop Off", response.data.data)
            }
        } catch (e) {
            console.log('Error fetching', e)
        } finally {
            setdropOffLoading(false);
        }
    }

    const getDeliveryFee = async () => {
        try {
            setLoading(true);

            const token = await AsyncStorage.getItem('BearerToken');
            const response = await axios.get(`${API_BASE_URL}delivery-fee?pickup=${formData.selectedErrandArea.title}&dropoff=${formData.selectedDropOffArea.title}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.status)

            if (response.status === 200) {
                setdeliveryFee(response.data.data)
                console.log(response.data.data)
            }
        } catch (e) {
            console.log('Error fetching', e)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPickupLandmark();
    }, []);

    // Fetch dropoff landmarks when pickup changes
    useEffect(() => {
        if (formData.selectedErrandArea) {
            getDropLandmark();
        } else {
            setDropOffLandmark([]); // Clear dropoff landmarks
            setFormData(prev => ({ ...prev, selectedDropOffArea: null })); // Clear selectedDropOffArea
            dropoffInputRef.current?.clear(); // Clear input text
        }
    }, [formData.selectedErrandArea]);

    // Handle delivery fee calculation
    useEffect(() => {
        if (formData.selectedErrandArea && formData.selectedDropOffArea) {
            getDeliveryFee();
        } else {
            setdeliveryFee(0);
        }
    }, [formData.selectedErrandArea, formData.selectedDropOffArea]);

    useEffect(() => {
        const newErrors = {};
        const validatePhone = (number) => /^(0(70|71|80|81|90|91))\d{8}$/.test(number);

        if (formData.errandLocation.length < 10) {
            if (formData.errandLocation.length > 0) newErrors.errandLocation = 'Address is to short';
            else newErrors.errandLocation = 'Enter Errand Location Address';
        }

        if (formData.dropoffLocation.length < 10) {
            if (formData.dropoffLocation.length > 0) newErrors.dropoffLocation = 'Address is to short';
            else newErrors.dropoffLocation = 'Enter Errand Location Address';
        }


        if (formData.receiverName.length > 0 && formData.receiverName.length <= 3) newErrors.receiverName = 'Name must be greater than 3 characters';
        if (formData.senderName.length > 0 && formData.senderName.length <= 3) newErrors.senderName = 'Name must be greater than 3 characters';
        

        if (formData.receiverPhone.length > 0) {
            if (formData.receiverPhone.length !== 11) newErrors.receiverPhone = 'Phone must be 11 digits';
            else if (!validatePhone(formData.receiverPhone)) newErrors.receiverPhone = 'Invalid Nigerian phone number';
        }

        if (formData.senderPhone.length > 0) {
            if (formData.senderPhone.length !== 11) newErrors.senderPhone = 'Phone must be 11 digits';
            else if (!validatePhone(formData.senderPhone)) newErrors.senderPhone = 'Invalid Nigerian phone number';
        }

        if (!formData.selectedErrandArea) newErrors.selectedErrandArea = 'Please select errand area';

        if (!formData.selectedDropOffArea) newErrors.selectedDropOffArea = 'Please select Drop Off area';
        

        const isValid = 
            formData.receiverName.length > 3 &&
            formData.receiverPhone.length === 11 &&
            validatePhone(formData.receiverPhone) && 
            formData.selectedErrandArea &&
            formData.selectedDropOffArea &&
            deliveryFee && 
            selectedItems.length > 0;

        setErrors(newErrors);
        setIsFormComplete(!isValid);
    }, [formData, selectedItems,  deliveryFee]);

    const handlePickupSelect = (item) => {
        setFormData(prev => ({ ...prev, selectedErrandArea: item })); // Update selectedErrandArea
        setFormData(prev => ({ ...prev, selectedDropOffArea: null })); // Clear selectedDropOffArea
        setDropOffLandmark([]); // Clear dropoff landmarks
        dropoffInputRef.current?.clear(); // Clear input text
    };

    // Handle dropoff selection
    const handleDropoffSelect = (item) => {
        setFormData(prev => ({ ...prev, selectedDropOffArea: item })); // Update selectedDropOffArea
    };

    // Handle clear event for dropoff
    const handleClearDropoff = () => {
        setFormData(prev => ({ ...prev, selectedDropOffArea: null })); // Clear selectedDropOffArea
        dropoffInputRef.current?.clear(); // Clear input text
    };


    const itemAmountFn = () => {
        if (!useInsurance) {
            setItemAmount(800)
        } else setItemAmount(0)
        setUseInsurance(!useInsurance)
    }
    
    const validatePhoneNumber = (number) => {
        const isValid = /^\d{11}$/.test(number) && number.startsWith('0');
        return isValid ? '' : 'Invalid Nigerian phone number';
    };

    const validateEmail = (email) => {
        const isValid = /^[\w-.]+@[\w-]+\.[a-z]{2,7}$/i.test(email);
        return isValid ? '' : 'Invalid email address';
    };

    const selectPackage = (item) => {
        if (selectedItems.includes(item)) {
        setSelectedItems(selectedItems.filter((selected) => selected !== item));
        } else {
        setSelectedItems([...selectedItems, item]);
        }
    };

    const proceedToGlobalCart = () => {
        const globalCartItem = {
            services: 'Package',
            formDetails: formData,
            items: selectedItems,
            deliveryFee,
            itemAmount,
            totalAmount,
        };
        addToGlobalCart(globalCartItem);
        Alert.alert('Success', 'Order added to cart', [{ text: 'Ok', onPress: () => router.replace('cart'), style: "success" }]);
    };


  return (
    <ScrollView className='bg-white flex-1'>
      <View className='px-6 mb-10'>

        <Text className='font-Raleway-Bold text-2xl mt-8 mb-4'>Delivery Details</Text>
        <View className="">
            <View className="flex-row">
                <FormField
                    title="Errand Address"
                    placeholder="Errand Address"
                    otherStyles="w-[49%] mr-2"
                    value={formData.errandLocation}
                    handleChangeText={(value) => setFormData(prev => ({ ...prev, errandLocation: value }))}
                    error={errors.errandLocation}
                />

                <View className="flex-1">
                    <CustomDropdown
                        title="Pickup Landmark"
                        placeholder="Select Pickup Area"
                        dataSet={pickupLandmark.map((landmark, index) => ({
                            id: index,
                            title: landmark,
                        }))}
                        onSelectItem={handlePickupSelect}
                        error={errors.selectedErrandArea}
                        loading={pickUpLoading}
                        onClear={() => {
                            setFormData(prev => ({ ...prev, selectedErrandArea: null }));
                            setFormData(prev => ({ ...prev, selectedDropOffArea: null }));
                            setDropOffLandmark([]);
                            dropoffInputRef.current?.clear(); // Clear input text
                        }}
                    />
                </View>
            </View>

            <View className="flex-row mt-7">
                <FormField
                    title="Dropoff Address"
                    placeholder="Dropoff Address"
                    otherStyles={`${formData.selectedErrandArea ? "w-[49%]" : "w-full"} mr-2`}
                    value={formData.dropoffLocation}
                    handleChangeText={(value) => setFormData(prev => ({ ...prev, dropoffLocation: value }))}
                    error={errors.dropoffLocation}
                />

                {formData.selectedErrandArea && (
                    <View className="flex-1">
                        <CustomDropdown
                            title="Dropoff Landmark"
                            placeholder="Select Dropoff Area"
                            dataSet={dropOffLandmark.map((landmark, index) => ({
                                id: index,
                                title: landmark,
                            }))}
                            loading={dropOffLoading}
                            error={errors.selectedDropOffArea}
                            onSelectItem={handleDropoffSelect}
                            onClear={handleClearDropoff}
                            initialValue={formData.selectedDropOffArea ? formData.selectedDropOffArea.id : undefined}
                            textInputProps={{
                                ref: dropoffInputRef,
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
        <View className="bg-secondary-100 mt-4 p-4 rounded-lg flex-row justify-between items-center">
            <Text className="font-SpaceGrotesk-Medium text-md flex-1">Delivery Fee</Text>
            <Text className="font-SpaceGrotesk-Medium text-md">₦ {deliveryFee}</Text>
        </View>

        <Text className='font-Raleway-Bold text-2xl mt-10 mb-4'>Sender Information</Text>
        <View className=''>
            <FormField 
                title="Name"
                placeholder="Adebola Ibrahim Nneka"
                handleChangeText={(value) => setFormData(prev => ({ ...prev, senderName: value }))}
                value={formData.senderName}
                error={errors.senderName}
            />
            <FormField 
                title="Phone Number"
                placeholder="08000000000"
                otherStyles='mt-5'
                keyboardType="phone-pad"
                handleChangeText={(value) => setFormData(prev => ({ ...prev, senderPhone: value }))}
                value={formData.senderPhone}
                error={errors.senderPhone}
            />
            {/* <FormField 
                title="Email"
                placeholder="email@example.com"
                otherStyles='mt-4'
                keyboardType="email-address"
                handleChangeText={(value) => handleChangeText('senderEmail', value)}
                value={formData.senderEmail}
                error={errors.senderEmail}
            /> */}
        
        </View>

        <Text className='font-Raleway-Bold text-2xl mt-10 mb-4'>Receiver Information</Text>
        <View className=''>
            <FormField 
                title="Name"
                placeholder="Adebola Ibrahim Nneka"
                handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverName: value }))}
                error={errors.receiverName} 
                value={formData.receiverName}
            />
            <FormField 
                title="Phone Number"
                placeholder="08000000000"
                otherStyles='mt-5'
                keyboardType="phone-pad"
                handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverPhone: value }))}
            value={formData.receiverPhone}
            error={errors.receiverPhone}
            />
            {/* <FormField 
                title="Email"
                placeholder="email@example.com"
                otherStyles='mt-4'
                keyboardType="email-address"
                handleChangeText={(value) => handleChangeText('receiverEmail', value)}
                value={formData.receiverEmail}
                error={errors.receiverEmail}
            /> */}
        
        </View>

        <Text className='font-Raleway-Bold text-2xl mt-10 mb-4'>What's in the package?</Text>
        <View className='flex-row gap-x-4 bg-primary-300 p-4 rounded-lg items-center'>
            <View className='bg-primary items-center justify-center rounded-full p-2'>
            <MaterialCommunityIcons name="sign-caution" size={24} color="white" />
            </View>
            <View className='flex-1'>
                <Text className='font-SpaceGrotesk-Medium text-lg'>Note</Text>
                <Text className='font-SpaceGrotesk-Medium text-sm'>The package size limits and weight must not exceed 65 x 55 x 40 cm and 20kg respectively</Text>
            </View>
        </View>
        <View className='flex flex-wrap w-full flex-row mt-4 gap-3'>
            {['Food', 'Clothes', 'Books', 'Medicine', 'Phone', 'Document', 'Other', 'Prefer not to say'].map((item, index) => (
                <TouchableOpacity key={index} onPress={() => selectPackage(item)} className={`rounded-xl ${selectedItems.includes(item) ? 'bg-primary-100' : 'bg-gray-borderDisabled'}`}>
                  <Text className="font-SpaceGrotesk-Medium text-md p-3 px-5 w-[100%]">{item}</Text>
                </TouchableOpacity>
              ))}
        </View>

        <Text className='font-Raleway-Bold text-2xl mt-10 mb-4'>Package Protection</Text>
        <TouchableOpacity onPress={itemAmountFn} className='flex-row gap-x-4 border border-gray-borderDefault p-4 rounded-lg items-center'>
            <Ionicons name="shield-checkmark" size={24} color="#00a859" />
            <View className='flex-1'>
                <Text className='font-SpaceGrotesk-Medium text-lg'>Apply package protection</Text>
                <Text className='font-SpaceGrotesk-Medium text-sm'>Use our insurance to safeguard your packages against any incidents. We've got you covered!</Text>
            </View>
            {useInsurance ? <AntDesign name="checkcircleo" size={20} color="#fdcd11" /> : <Entypo name="circle" size={20} color="#fdcd11" />}
            
        </TouchableOpacity>

        {useInsurance && (
            <View className='bg-secondary-100 mt-4 p-4 rounded-lg flex-row justify-between items-center'>
                <Text className='font-SpaceGrotesk-Medium text-md flex-1'>Insurance Fee</Text>
                <Text className='font-SpaceGrotesk-Medium text-md'>₦ {itemAmount}</Text>
            </View>
        )}

        <CustomButton 
            title={`Add to Cart ₦${totalAmount}`}
            containerStyles="bg-primary mt-5 "
            textStyles="text-white"
            handlePress={proceedToGlobalCart}
            disabled={isFormComplete}
        />
      </View>
      {loading && <Loading />}
    </ScrollView>
  )
}

export default Package