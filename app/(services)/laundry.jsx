import { View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AntDesign from "@expo/vector-icons/AntDesign";
import { BlurView } from 'expo-blur';
import { router } from "expo-router";

import LaundryService from '../../components/LaundryService';
import { useGlobalCart } from "../../context/GlobalCartContext";
import CustomButton from '../../components/CustomButton';
import FormField from "../../components/FormField";
import CustomDropdown from '../../components/CustomDropdown'; 
import LaundryList from '../../components/LaundryList';

const serviceTypes = [
	{ id: 'wash', title: 'Wash' },
	{ id: 'iron', title: 'Iron' },
	{ id: 'starch', title: 'Starch' },
	{ id: 'wash_starch', title: 'Wash, Starch' },
	{ id: 'wash_iron', title: 'Wash, Iron' },
	{ id: 'starch_iron', title: 'Starch, Iron' },
	{ id: 'wash_starch_iron', title: 'Wash, Starch, Iron' },
  ];

const Laundry = () => {

	const navigation = useNavigation();
	const [laundry, setLaundry] = useState([])
	const [useUserInfo, setUseUserInfo] = useState(false);
	const [selectedDelivery, setSelectedDelivery] = useState(null);
	const [isCartVisible, setIsCartVisible] = useState(false);
	const [addButtonDisabled, setAddButtonDisabled] = useState(true);
	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [selectedLaundry, setSelectedLaundry] = useState(null);
	const [cartItems, setCartItems] = useState([]);
	const [formData, setFormData] = useState({ receiverName: '', receiverPhone: '', receiverEmail: '' });
	const [errors, setErrors] = useState({});
	const { addToGlobalCart } = useGlobalCart();
	const snapPoints = useMemo(() => ['35%', '40%'], []);
	const [selectedGarment, setSelectedGarment] = useState(null);
	const [selectedServiceType, setSelectedServiceType] = useState(null);

	React.useEffect(() => {
		const unsubscribe = navigation.addListener('beforeRemove', (e) => {
		  console.log(e.data.action.payload); // Debug log

		  // Check if payload exists and has a name property
		  if (isCartVisible && cartItems.length >= 0 && (!e.data.action.payload || e.data.action.payload.name !== "(tabs)")) {
			e.preventDefault(); // Prevent navigation

			Alert.alert(
			  'Warning',
			  'Your cart will be emptied if you leave this page. Do you want to proceed?',
			  [
				{
				  text: 'Cancel',
				  onPress: () => {}, // Do nothing
				  style: 'cancel',
				},
				{
				  text: 'OK',
				  onPress: () => {
					setCartItems([]); // Clear the cart
					resetAllStates();
				  },
				},
			  ]
			);
		  }
		});

		return unsubscribe; // Cleanup the listener
	  }, [cartItems, navigation]);

	useEffect(() => {
		const fetchLaundries = async () => {
			try {
				const storedLaundries = await AsyncStorage.getItem('laundries');
				if(storedLaundries) {
					const parseLaundry = JSON.parse(storedLaundries);
					setLaundry(parseLaundry)
				}
			} catch (error) {
				Alert.alert('Error', 'Failed to fetch vendors');
				console.error(error);
			}
		};

		fetchLaundries();
	}, []);
	
	useEffect(() => {
		setAddButtonDisabled(!(selectedGarment && selectedServiceType));
	}, [selectedGarment, selectedServiceType]);

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
			formData.receiverEmail;

		setErrors(newErrors);
		setButtonDisabled(!isValid);
	}, [formData, selectedDelivery]);

	const handleCheckboxPress = async () => {
		const newUseUserInfo = !useUserInfo;
		setUseUserInfo(newUseUserInfo);

		if (newUseUserInfo) {
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
		}
	  };

	const handleAddService = () => {
		if (!selectedGarment || !selectedServiceType || !selectedLaundry) return;
  
		const garment = selectedLaundry.items.find(s => s.id === selectedGarment.id);
		const serviceKeys = selectedServiceType.id.split('_');
	
		// Create formatted service string with prices
		const serviceWithPrices = serviceKeys.map(service => 
		  `${service.charAt(0).toUpperCase() + service.slice(1)}:${garment?.price?.[service] || 0}`
		).join(', ');
  
		const pricePerItem = serviceKeys.reduce((sum, service) => 
		  sum + (garment?.price?.[service] || 0), 0
		);
  
		const newItem = {
		  garmentId: selectedGarment.id,
		  item_id: selectedGarment.id,
		  name: garment.name,
		  pricePerItem: Number(pricePerItem.toFixed(2)),
		  quantity: 1,
		  serviceName: serviceWithPrices,
		  total: Number(pricePerItem.toFixed(2)),
		};
  
		setCartItems(prev => [...prev, newItem]);
		setSelectedGarment(null);
		setSelectedServiceType(null);
	  };

	const handleQuantityChange = (index, quantity) => {
		setCartItems(prev => {
			const newItems = [...prev];
			newItems[index].quantity = quantity;
			newItems[index].total = newItems[index].pricePerItem * quantity;
			
			if (quantity <= 0) {
				return newItems.filter((_, i) => i !== index);
			}
			return newItems;
		});
	};

	const handleDelete = (index) => {
		setCartItems(prev => prev.filter((_, i) => i !== index));
	};


	const addToCart = () => {
		const deliveryDetails = selectedDelivery ? {
		  landmark: selectedDelivery.landmark,
		  price: parseFloat(selectedDelivery.price),
		  vendor_id: selectedDelivery.vendor_id,
		  id: selectedDelivery.id
		} : null;
  
		const globalCartItem = {
		  services: 'Laundry',
		  laundry: selectedLaundry.name,
		  laundry_id: selectedLaundry.id,
		  location: selectedLaundry.address,
		  items: cartItems,
		  itemAmount: itemAmount,
		  totalAmount: totalAmount,
		  deliveryFee: deliveryDetails,
		  imageSource: `https://yourerrandsguy.com.ng/${selectedLaundry.image}`,
		  formDetails: showReceiverInfo ? formData : null
		};
  
		console.log(globalCartItem)
		addToGlobalCart(globalCartItem);
		router.replace('cart')
		resetAllStates();
	  };

	const showReceiverInfo = cartItems.length > 0;

	const itemAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
	const deliveryFee = selectedDelivery ? parseFloat(selectedDelivery.price) : 0;
	const totalAmount = itemAmount + deliveryFee;

	// Reset all states when closing the bottom sheet
	const resetAllStates = () => {
		setCartItems([]);
		setFormData({ receiverName: '', receiverPhone: '', receiverEmail: '' });
		setErrors({});
		setIsCartVisible(false);
	};

	return (
		<View className="bg-white flex-1 relative">
			<ScrollView className="bg-white flex-1">
			<View className="mt-6 px-6">
				<Text className="font-SpaceGrotesk-Bold text-2xl mb-8">All Vendors</Text>
			</View>
				<View className="px-6">
					{laundry.map((item) => (
						<LaundryList
							key={item.id}
							image={item.image}
							laundryName={item.name}
							laundryDecription={item.description}
							address={item.address}
							deliveryPrice={item.items[1].price.wash}
							rating={item.rating}
							reviews={item.reviews}
							onPress={() => {
								setSelectedLaundry(item);
								setIsCartVisible(true);
							}}
						/>
					))}
				</View>
			</ScrollView>

			{isCartVisible && selectedLaundry && (
				<BlurView
					intensity={30}
					tint="systemThinMaterial"
					experimentalBlurMethod="dimezisBlurView"
					style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
				>
					<BottomSheet
						maxDynamicContentSize={Dimensions.get('window').height * 0.8}
						snapPoints={snapPoints}
						enablePanDownToClose
						onClose={resetAllStates}
						backgroundComponent={({ style }) => (
							<View className="bg-white rounded-t-3xl" style={style} /> 
						)}
						handleComponent={() => (
							<View className="pt-3 pb-3">
								<View className="w-12 h-1 bg-primary rounded-full self-center" />
							</View>
						)}
					>
						<View className="px-6 pt-6 mb-8"> {/* Reduced margin bottom */}
							<Text className="text-2xl font-SpaceGrotesk-Bold text-primary">
								{selectedLaundry.name}
							</Text>
							<Text className="text-gray-600 font-Raleway-Regular text-sm">
								{selectedLaundry.address}
							</Text>
						</View>

						<BottomSheetScrollView className="px-6">
		
							<View className="flex-row items-center mb-6 gap-2">
								<View className="flex-1">
									<CustomDropdown
										placeholder="Select Garment Type"
										dataSet={selectedLaundry.items.map(service => ({
											id: service.id,
											title: service.name,
										}))}
										onSelectItem={setSelectedGarment}
										containerBgColor='#f3f4f6'
									/>
								</View>

								<View className="flex-1">
									<CustomDropdown
										placeholder="Service Type"
										dataSet={serviceTypes}
										onSelectItem={setSelectedServiceType}
										containerBgColor='#f3f4f6'
									/>
								</View>

								<CustomButton
									title="Add"
									handlePress={handleAddService}
									containerStyles={`h-[42px] ${addButtonDisabled ? 'bg-gray-300' : 'bg-primary'} px-4 rounded-lg`}
									textStyles="text-white text-sm"
									disabled={addButtonDisabled}
								/>
							</View>

							{/* Render services using LaundryService component */}
							{cartItems.map((item, index) => (
								<LaundryService
									key={index}
									name={`${item.name} - ${item.serviceName}`}
									price={item.pricePerItem}
									quantity={item.quantity}
									onQuantityChange={(q) => handleQuantityChange(index, q)}
									onDelete={() => handleDelete(index)}
								/>
							))}

							{showReceiverInfo && (
								<>
									<Text className="font-Raleway-Bold text-primary text-2xl mt-6 mb-4">
										Receiver Information
									</Text>

									<View className="flex-row items-center mb-4">
										<TouchableOpacity onPress={handleCheckboxPress}>
											<AntDesign
											name={useUserInfo ? "checkcircle" : "checkcircleo"}
											size={24}
											color={useUserInfo ? "green" : "gray"}
											/>
										</TouchableOpacity>
									  	<Text className="ml-2 font-SpaceGrotesk-Medium">Use my information</Text>
									</View>

									<View className="flex-wrap flex-row w-full justify-between">
										<FormField
											title="Name"
											placeholder="Adebola Ibrahim Nneka"
											otherStyles="w-[49%]"
											handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverName: value }))}
											value={formData.receiverName}
											error={errors.receiverName}
										/>
										<FormField
											title="Phone Number"
											placeholder="08000000000"
											otherStyles="w-[49%]"
											keyboardType="phone-pad"
											handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverPhone: value }))}
											value={formData.receiverPhone}
											maxLength={11}
											error={errors.receiverPhone}
										/>

										<FormField
											title="Delivery Address"
											placeholder="Delivery Address"
											otherStyles="w-full mt-4"
											handleChangeText={(value) => setFormData(prev => ({ ...prev, receiverEmail: value }))}
											value={formData.receiverEmail}
											error={errors.receiverEmail}
										/>

										<View className='w-full mt-4'>
											<CustomDropdown
											title="Delivery Landmark"
											placeholder="Select Delivery Area"
											dataSet={selectedLaundry.deliveryfee.map(fee => ({
												id: fee.id,
												title: `${fee.landmark} - ₦${fee.price}`,
												...fee
											}))}
											onSelectItem={setSelectedDelivery}
											error={errors.delivery}
											/>

										</View>
									</View>
								</>
							)}

							{/* Item Amount, Delivery Fee, and Total Amount */}
							<View className="bg-primary-200 rounded-lg mt-4 p-4">
								{cartItems.map((item, index) => ( 
										<View key={index} className="flex-row justify-between items-center">
											<Text className="font-Raleway-Regular text-md flex-1">
												{item.garmentName} - {item.serviceName} (x{item.quantity})
											</Text>
											<Text className="font-SpaceGrotesk-Regular text-md">
												₦{item.total.toFixed(2)}
											</Text>
										</View>
									))}
								
								<View className="flex-row justify-between items-center">
									<Text className="font-SpaceGrotesk-Semibold text-md flex-1">Delivery Fee</Text>
									<Text className="font-SpaceGrotesk-Semibold text-md">₦{deliveryFee.toFixed(2)}</Text>
								</View>
								<View className="flex-row justify-between items-center">
									<Text className="font-SpaceGrotesk-Bold text-lg flex-1">Total Amount</Text>
									<Text className="font-SpaceGrotesk-Bold text-lg">₦{totalAmount.toFixed(2)}</Text>
								</View>
							</View>
						</BottomSheetScrollView>

						<View className='px-6 pb-6 pt-2'>
							<CustomButton
								title={buttonDisabled ? "Select Service to proceed" :"Add to Cart"}
								handlePress={addToCart}
								containerStyles={`${buttonDisabled ? 'bg-secondary opacity-30' : 'bg-secondary'}  py-4 rounded-xl`}
								disabled={buttonDisabled}
							/>

						</View>
					</BottomSheet>
				</BlurView>
			)}
		</View>
	);
};

export default Laundry;