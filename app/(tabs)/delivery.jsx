import React, { useState } from "react";
import { View, Text, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "expo-router";
import axios from 'axios';
import * as Burnt from 'burnt';

import OrderList from "../../components/OrderList";
import Loading from '../../components/Loading';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const Delivery = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch history data from the API
  const getHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('BearerToken');

      const response = await axios.get(`${API_BASE_URL}orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const sortedData = response.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setHistory(sortedData);
        await AsyncStorage.setItem('history', JSON.stringify(sortedData));
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      const storedHistory = await AsyncStorage.getItem('history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      Burnt.toast({
        title: 'Failed to fetch orders!',
        preset: 'error',
        from: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  // Group orders by time period including Today, Yesterday, Last Week and Monthly/Earlier
  const groupOrdersByTime = (orders) => {
    const now = new Date();

    // Get the start of today (00:00:00)
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Get the start of yesterday
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Get the start of last week (7 days ago from today)
    const lastWeekStart = new Date(todayStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Prepare groups
    const grouped = {
      "Today": [],
      "Yesterday": [],
      "Last Week": [],
      "Monthly": [], // or "Earlier" if you prefer
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);

      if (orderDate >= todayStart) {
        grouped["Today"].push(order);
      } else if (orderDate >= yesterdayStart && orderDate < todayStart) {
        grouped["Yesterday"].push(order);
      } else if (orderDate >= lastWeekStart && orderDate < yesterdayStart) {
        grouped["Last Week"].push(order);
      } else {
        grouped["Monthly"].push(order);
      }
    });

    // Convert grouped object to an array of sections, filtering out empty ones
    return Object.entries(grouped)
      .filter(([_, items]) => items.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  // Fetch data every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      getHistory();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 h-full w-full bg-white">
      <View className="flex-row justify-between items-center rounded-lg mt-8 mb-4 px-6">
        <Text className="font-SpaceGrotesk-Bold text-2xl">My Deliveries</Text>
      </View>

      {loading ? (
        <Loading />
      ) : (
        <SectionList
          sections={groupOrdersByTime(history)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <OrderList
              restaurantName={item.vendor?.name || "Unknown Vendor"}
              serviceType={item.service_type}
              itemAmount={item.item_amount}
              deliveryAmount={item.delivery_fee}
              totalAmount={item.total_amount}
              status={item.status}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="font-Raleway-SemiBold text-xl bg-secondary p-4 mt-4 px-6 mb-4">
              {title}
            </Text>
          )}
          ListEmptyComponent={
            <Text className="font-Raleway text-center mt-8">
              No orders found.
            </Text>
          }
        />
      )}

      <View className='mt-8'>
        
      </View>
    </SafeAreaView>
  );
};

export default Delivery;
