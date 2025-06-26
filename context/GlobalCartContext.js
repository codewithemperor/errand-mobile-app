import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const GlobalCartContext = createContext();

export const useGlobalCart = () => useContext(GlobalCartContext);

export const GlobalCartProvider = ({ children }) => {
  const [globalCart, setGlobalCart] = useState([]);


  // Load globalCart from AsyncStorage on mount
  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const storedCart = await AsyncStorage.getItem("globalCart");
        if (storedCart) setGlobalCart(JSON.parse(storedCart));
        
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    };
    loadCartFromStorage();
  }, []);


  useEffect(() => {
    const handleTransactionId = async () => {
      try {
        if (globalCart.length > 0) {
          // Get user data from AsyncStorage
          const userData = await AsyncStorage.getItem("user");
          const user = JSON.parse(userData);
          console.log(user.id);
          if (!userData) {
            return;
          }

          const transactionId = `ER${user.id}${new Date().toISOString().replace(/[-:T.]/g, '')}`;
          await AsyncStorage.setItem("transactionId", transactionId);
        } else {
          // Clear transaction ID when cart is empty
          console.log("Clearing transaction")
          await AsyncStorage.removeItem("transactionId");
        } 
      } catch (error) {
        console.error("Error handling transaction ID:", error);
      }
    };

    handleTransactionId();
  }, [globalCart]); // Run whenever globalCart changes

  // Add to cart
  const addToGlobalCart = async (item) => {
    const updatedCart = [...globalCart, item];
    setGlobalCart(updatedCart);
    try {
      await AsyncStorage.setItem("globalCart", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  // Remove from cart
  const removeFromGlobalCart = (indexToRemove) => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedCart = globalCart.filter(
              (_, index) => index !== indexToRemove
            );
            setGlobalCart(updatedCart);
            try {
              await AsyncStorage.setItem(
                "globalCart",
                JSON.stringify(updatedCart)
              );
            } catch (error) {
              console.error("Error updating cart:", error);
            }
          },
        },
      ]
    );
  };

  // Clear cart
  const clearGlobalCart = async () => {
    setGlobalCart([]);
    try {
      await AsyncStorage.removeItem("globalCart");
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  return (
    <GlobalCartContext.Provider
      value={{ globalCart, addToGlobalCart, removeFromGlobalCart, clearGlobalCart }}
    >
      {children}
    </GlobalCartContext.Provider>
  );
};