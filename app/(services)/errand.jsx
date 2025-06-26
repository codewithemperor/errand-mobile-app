import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from 'axios';

import FormField from "../../components/FormField";
import CustomDropdown from "../../components/CustomDropdown";
import CustomButton from "../../components/CustomButton";
import { useGlobalCart } from "../../context/GlobalCartContext";
import Loading from "../../components/Loading";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

const Errand = () => {
	const { addToGlobalCart } = useGlobalCart();
	const dropoffInputRef = useRef(null); 

	const [formData, setFormData] = useState({
		errandLocation: "",
		dropoffLocation: "",
		receiverName: "",
		receiverPhone: "",
		receiverEmail: "",
		selectedErrandArea: null,
		selectedDropOffArea: null,
	});

	// State for adding individual items
	const [itemData, setItemData] = useState({
		description: "",
		rate: "",
		quantity: 1,
	});


	const [loading, setLoading] = useState(false);
	const [pickUpLoading, setpickUpLoading] = useState(false);
	const [dropOffLoading, setdropOffLoading] = useState(false);

	const [pickupLandmark, setPickUpLandmark] = useState([]);
	const [dropOffLandmark, setDropOffLandmark] = useState([]);

	const [items, setItems] = useState([]);
	const [isFormComplete, setIsFormComplete] = useState(false);
	const [useUserInfo, setUseUserInfo] = useState(false);
	const [errors, setErrors] = useState({});
	const [deliveryFee, setdeliveryFee] = useState();



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


		if (formData.receiverName.length > 0 && formData.receiverName.length <= 3) {
			newErrors.receiverName = 'Name must be greater than 3 characters';
		}

		if (itemData.description.length > 0 && itemData.description.length <= 3) {
			newErrors.description = 'Description is too short';
		}


		if (formData.receiverPhone.length > 0) {
			if (formData.receiverPhone.length !== 11) {
				newErrors.receiverPhone = 'Phone must be 11 digits';
			} else if (!validatePhone(formData.receiverPhone)) {
				newErrors.receiverPhone = 'Invalid Nigerian phone number';
			}
		}

		if (!formData.selectedErrandArea) {
			newErrors.selectedErrandArea = 'Please select errand area';
		}

		if (!formData.selectedDropOffArea) {
			newErrors.selectedDropOffArea = 'Please select Drop Off area';
		}

		const isValid = 
			formData.receiverName.length > 3 &&
			formData.receiverPhone.length === 11 &&
			validatePhone(formData.receiverPhone) && 
			formData.selectedErrandArea &&
			formData.selectedDropOffArea &&
			deliveryFee && 
			items.length > 0;

		setErrors(newErrors);
		setIsFormComplete(!isValid);
	}, [formData, items, itemData,  deliveryFee]);
	
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



	const handleAddItem = () => {
		if (itemData.description && itemData.rate && !isNaN(itemData.rate)) {
			const newItem = {
				description: itemData.description,
				rate: itemData.rate,
				quantity: itemData.quantity,
			};
			setItems((prev) => [...prev, newItem]);
			setItemData({ description: "", rate: "", quantity: 1 }); // Reset itemData after adding
		}
	};

	const handleDeleteItem = (index) => {
		setItems((prev) => prev.filter((_, i) => i !== index));
	};

	const handleIncrease = () => setItemData((prev) => ({ ...prev, quantity: prev.quantity + 1 }));

	const handleDecrease = () => {
		setItemData((prev) => {
			if (prev.quantity > 1) return { ...prev, quantity: prev.quantity - 1 };
			return prev;
		});
	};

	const itemAmount = items.reduce((acc, item) => acc + parseInt(item.rate) * item.quantity, 0);
	const totalAmount = itemAmount + parseFloat(deliveryFee);

	const proceedToGlobalCart = () => {
		const globalCartItem = {
			services: "Errand",
			formDetails: formData,
			items: items,
			deliveryFee,
			itemAmount,
			totalAmount,
		};
		addToGlobalCart(globalCartItem);
		Alert.alert("Success", "Order added to cart", [{ text: "Ok", onPress: () => router.replace("cart") }]);
	};

	return (
		<ScrollView className="bg-white flex-1">
			<View className="px-6 mb-10">
				<Text className="font-Raleway-Bold text-2xl mt-8 mb-4">Delivery Details</Text>
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

				<Text className="font-Raleway-Bold text-2xl mt-10 mb-4">What do you want to send us?</Text>
				<View className="w-full flex-row flex-wrap gap-3 items-end justify-between">
					<FormField 
						title="Description" 
						placeholder="Narrate your errand" 
						otherStyles="w-full" 
						handleChangeText={(value) => setItemData(prev => ({ ...prev, description: value }))} 
						value={itemData.description} 
						error={errors.description}
					/>

					<FormField 
						title="Rate" 
						placeholder="Amount in Naira" 
						otherStyles="w-[50%]" 
						keyboardType="number-pad" 
						handleChangeText={(value) => setItemData(prev => ({ ...prev, rate: value }))} 
						value={itemData.rate} 
					/>

					<View className="flex-1">
						<Text className="text-xl font-SpaceGrotesk-Semibold mb-1 text-gray-textSubtitle">Quantity</Text>
						<View className="flex-row items-center justify-between border border-gray-300 rounded-md h-[52]">
							<TouchableOpacity onPress={handleDecrease} className="px-3 py-2">
								<Text className="text-lg font-bold">-</Text>
							</TouchableOpacity>
							<Text className="px-4 py-2 text-lg font-SpaceGrotesk-Semibold">{itemData.quantity}</Text>
							<TouchableOpacity onPress={handleIncrease} className="px-3 py-2">
								<Text className="text-lg font-bold">+</Text>
							</TouchableOpacity>
						</View>
					</View>

					<CustomButton title="Add" containerStyles="bg-primary px-5 h-[54] rounded-full" textStyles="text-white" handlePress={handleAddItem} disabled={!itemData.description || !itemData.rate || !!errors.rate} />
				</View>

				{items.length > 0 && (
					<View className="border border-gray-borderDefault p-4 rounded-lg items-center mt-6">
						{items.map((item, index) => (
							<View key={index} className="flex-row gap-x-4 border-b mb-4 pb-4 border-gray-borderDefault">
								<Text className="font-Raleway-Medium text-md flex-1">
									{item.description} (x{item.quantity})
								</Text>
								<Text className="font-SpaceGrotesk-Semibold text-primary-400 text-md">₦{item.rate}</Text>
								<TouchableOpacity onPress={() => handleDeleteItem(index)}>
									<Ionicons name="trash" size={20} color="red" />
								</TouchableOpacity>
							</View>
						))}

						<View className="bg-secondary mt-4 p-4 rounded-lg flex-row justify-between items-center">
							<Text className="font-SpaceGrotesk-Medium text-lg flex-1">Errand Amount</Text>
							<Text className="font-SpaceGrotesk-Medium text-lg">₦{itemAmount}</Text>
						</View>
					</View>
				)}

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
						error={errors.receiverName} 
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


				</View>

				<CustomButton title={`Add to Cart ₦${totalAmount}`} containerStyles="bg-primary mt-8 " textStyles="text-white" handlePress={proceedToGlobalCart} disabled={isFormComplete} />
			</View>
			{loading && <Loading />}
		</ScrollView>
	);
};

export default Errand;
