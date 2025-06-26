import React, { useRef, useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack } from 'react-native-paystack-webview';
import { router } from "expo-router";
import * as Burnt from 'burnt';
import axios from 'axios';

import { useGlobalCart } from '../../context/GlobalCartContext';
import CustomButton from "../../components/CustomButton";
import ErrandCartCard from '../../components/ErrandCartCard';
import PackageCartCard from "../../components/PackageCartCard";
import RestaurantCartCard from "../../components/RestaurantCartCard";
import Loading from '../../components/Loading';
import LaundryCartCard from "../../components/LaundryCartCard";

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL
const getUserData = async () => {
	try {
	  const userString = await AsyncStorage.getItem('user');
	  const user = JSON.parse(userString);
	  return user;
	} catch (error) {
	  console.error('Error getting user data:', error);
	  return null;
	}
  };
const Cart = () => {
	const { globalCart, removeFromGlobalCart, clearGlobalCart } = useGlobalCart();
	const paystackWebViewRef = useRef(null);
	const [loading, setLoading] = useState(false);

	const [transactionId, setTransactionId] = useState(null);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	

	useEffect(() => {
	const loadUserData = async () => {
		const user = await getUserData();
		if (user) {
		setFullName(user.fullname);
		setEmail(user.email);
		setPhone(user.phone);
		}
	};
	loadUserData();
	}, []);

	const loadTransactionID = async () => {
		try {
		  const id = await AsyncStorage.getItem('transactionId');
			if (id) {
				setTransactionId(id);
				return id; // Return the transaction ID for immediate use
			}
		  	return null;
		} catch (error) {
		  	console.error('Error loading transaction ID:', error);
		  	return null;
		}
	};


	const calculateTotalAmount = () => {
		return globalCart.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
	};

	const totalAmount = calculateTotalAmount();
	  
	const saveOrder = async () => {
	
		try {
			setLoading(true);

			const transactionId = await loadTransactionID();
			if (!transactionId) {
			  throw new Error('Transaction ID not found');
			}

			console.log("TransactionID", globalCart);

			const checkoutData = {
				cartItems: globalCart,
				totalAmount,
				transaction_id: transactionId
			};
			
			const token = await AsyncStorage.getItem('BearerToken');
			
			const response = await axios.post(
			`${API_BASE_URL}orders/save`,
			checkoutData,
			{
				headers: {
				Authorization: `Bearer ${token}`,
				},
			}
			);
			console.log('API Response:', response.status);
		
			if (response.status === 200) {
			Burnt.toast({
				title: 'Order Saved successfully!',
				preset: 'done',
				from: 'top',
			});
			paystackWebViewRef.current?.startTransaction()
			}
		} catch (error) {
			console.log(error.status)
			Burnt.toast({
				title: 'Order saving failed. Please contact support.',
				preset: 'error',
				from: 'top',
			});
		} finally {
			setLoading(false);
		}
	};

	const updateOrder = async (paystackResponse) => {
		try {

			setLoading(true);

			const transactionId = await loadTransactionID();
			if (!transactionId) {
			  throw new Error('Transaction ID not found');
			}
  
			console.log(transactionId, '2', paystackResponse.data.transactionRef?.trxref, '3', paystackResponse.data.event);
			console.log(paystackResponse.data.transactionRef?.trxref || 'cancelled',)
			const token = await AsyncStorage.getItem('BearerToken');
			// Send order to backend
			const response = await axios.post(
			`${API_BASE_URL}updateOrder`,
			{
				trans_id: transactionId,
				tx_ref: paystackResponse.data.transactionRef?.trxref || 'cancelled',
				status: paystackResponse.data.event,
			},
			{
				headers: {
				Authorization: `Bearer ${token}`,
				},
			}
			);


			console.log('API Response:', response.status);
		
	
	} catch (error) {
		console.error('Error updating order:', error);
		Burnt.toast({
			title: 'Order updating failed. Please contact support.',
			preset: 'error',
			from: 'top',
		  });
	} finally {
		setLoading(false);
	}
	};

	if (globalCart.length === 0) {
		return (
		<View className="flex-1 justify-center items-center bg-white">
			<Text className="font-SpaceGrotesk-Bold text-lg">No items in cart</Text>
		</View>
		);
	}

  return (
	<SafeAreaView className="flex-1 h-full w-full justify-between bg-white">
	  <Paystack  
		paystackKey={PAYSTACK_SECRET_KEY}
		amount={totalAmount.toFixed(2)}
		currency="NGN"
		channels={['card', 'bank', 'ussd', 'qr', 'mobile_money']}
		billingName={fullName}
		billingMobile={phone}
		billingEmail={email}
		activityIndicatorColor="green"
		onCancel={(paystackResponse) => {
			updateOrder(paystackResponse),
			Burnt.toast({
				title: 'Payment cancelled',
				preset: 'error',
				from: 'top',
			});
			}}
		onSuccess={(paystackResponse) => {
			updateOrder(paystackResponse);
			Burnt.toast({
				title: 'Order Placed successfully!',
				preset: 'done',
				from: 'top',
			});
			clearGlobalCart();
			router.push('delivery');
		}}

		ref={paystackWebViewRef}
	  />


	  <View className="flex-row justify-between items-center rounded-lg p-3 mt-4 px-6">
		<Text className="font-SpaceGrotesk-Bold text-2xl">Cart</Text>
	  </View>

	  <ScrollView className="p-4 px-6 pb-4">
		{globalCart.map((cartItem, index) => {
		  if (cartItem.services === "Restaurant") {
			return <RestaurantCartCard key={index} cartItem={cartItem} deleteFromCart={() => removeFromGlobalCart(index)}/>
			
		  } else if (cartItem.services === "Errand") {
			return <ErrandCartCard key={index} cartItem={cartItem} deleteFromCart={() => removeFromGlobalCart(index)}/>
			
		  } else if (cartItem.services === "Package") {
			return <PackageCartCard key={index} cartItem={cartItem} deleteFromCart={() => removeFromGlobalCart(index)} />

		  } else if (cartItem.services === "Laundry") {
			return <LaundryCartCard key={index} cartItem={cartItem} deleteFromCart={() => removeFromGlobalCart(index)} />

		  } else {
			return (
			  <View key={index} className="p-4">
				<Text className="font-SpaceGrotesk-Bold text-lg">Unknown service type: {cartItem.services}</Text>
			  </View>
			);
		  }
		})}

		<View className="p-4 px-6 pb-4"></View>
	  </ScrollView>

	<View className="px-6 pb-4 mt-3 bg-white">
	<CustomButton
		title={`Proceed to Checkout ₦${totalAmount.toFixed(2)}`}
		containerStyles="bg-primary"
		textStyles="text-white"
		handlePress={() => {
			saveOrder();
		}}
		disabled={loading || globalCart.length === 0}
	/>
	</View>
	
	{loading && <Loading /> }
	</SafeAreaView>
  );
};

export default Cart;
