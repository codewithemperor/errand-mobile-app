import { View, Text, ScrollView, TextInput, } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Burnt from 'burnt'
import { Toaster } from 'burnt/web';

import Loading from '../../components/Loading';
import CustomButton from '../../components/CustomButton'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

const verify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])
  const [timer, setTimer] = useState(60)
  const [showResendButton, setShowResendButton] = useState(false)
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('emailAddress')
        setEmail(storedEmail)
      } catch (error) {
        Burnt.toast({
          title: 'Failed to load email',
          preset: 'error',
          from: 'top',
        })
      }
    }
    fetchEmail()
  }, [])

    const handleChangeText = (text, index) => {
        if (text.length > 1) {
          return; 
        }
    
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
    
        // Automatically move to the next input
        if (text && index < otp.length - 1) {
          inputRefs.current[index + 1].focus();
        }
      };
    
      const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
          inputRefs.current[index - 1].focus();
        }
      };
    
      useEffect(() => {
        let interval = null;
        if (timer > 0) {
          interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer - 1);
          }, 1000);
        } else {
          setShowResendButton(true); // Show "Resend Code" button when timer reaches zero
        }
    
        return () => clearInterval(interval);
      }, [timer]);

      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

    const handleSubmit = async () => {
      const otpValue = otp.join('')
      if (otpValue.length < 6) {
        Burnt.toast({
          title: 'Please enter complete verification code',
          preset: 'error',
          from: 'top',
        })
        return
      }
  
      setLoading(true)
      try {
        const response = await axios.post(
          `${API_BASE_URL}verify-email`,
          { 
            email,
            verification_code: otpValue // Match API expected field name
          }
        )
  
        if (response.data.status) {
          // Save token and user data
          await AsyncStorage.setItem('BearerToken', response.data.data.token);

          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
  
          // Store popular items
          await AsyncStorage.setItem('popular', JSON.stringify(response.data.data.popular));
  
          // Store vendors
          await AsyncStorage.setItem('vendors', JSON.stringify(response.data.data.vendors));
  
          await Burnt.toast({
            title: response.data.message,
            preset: 'success',
            from: 'top',
          })
  
          router.replace('/home')
        }
      } catch (error) {
        let message = 'Unable to complete verification'
        
        if (error.response) {
          const { status, data } = error.response
          message = data.message || message
          
          if (data.data) {
            const errors = Object.values(data.data).flat().join(', ')
            message = `${message}: ${errors}`
          }
  
          // Handle already verified case
          if (status === 400 && data.message === 'Email is already verified.') {
            router.replace('./login')
          }
        }
  
        await Burnt.toast({
          title: message,
          preset: 'error',
          from: 'top',
        })
      } finally {
        setLoading(false)
      }
    }
  
    const handleResendCode = async () => {
      setLoading(true)
      try {
        const response = await axios.post(
          `${API_BASE_URL}resend`,
          { email }
        )
  
        if (response.data.status) {
          setTimer(60)
          setShowResendButton(false)
          await Burnt.toast({
            title: response.data.message,
            preset: 'success',
            from: 'top',
          })
        }
      } catch (error) {
        let message = 'Failed to resend code'
        
        if (error.response) {
          const { status, data } = error.response
          message = data.message || message
  
          // Handle specific cases
          if (status === 400 && data.message === 'Email is already verified.') {
            router.replace('/login')
          }
          if (status === 422) {
            const errors = Object.values(data.data).flat().join(', ')
            message = `${message}: ${errors}`
          }
        }
  
        await Burnt.toast({
          title: message,
          preset: 'error',
          from: 'top',
        })
      } finally {
        setLoading(false)
      }
    }
    
  return (
    <SafeAreaView className='h-full w-full bg-white'>
        <ScrollView className='h-[80vh] w-full'>
            <View className='flex-1 px-6 pt-12'>
                <View className="mb-8">
                    <Text className="text-3xl font-Raleway-Bold text-primary mb-1">Verify OTP</Text>
                    <Text className="text-sm font-SpaceGrotesk-Regular text-dark">Enter the 6 digit code sent to {email}</Text>
                </View>
            

                <View>
                    <View className="w-full flex-row justify-between">
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          value={digit}
                          onChangeText={(text) => handleChangeText(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          maxLength={1}
                          keyboardType="number-pad"
                          selectionColor="#605d55"
                          className="h-12 w-12 rounded-lg border border-gray-borderDefault font-SpaceGrotesk-Semibold text-xl text-center"
                        />
                      ))}
                    </View>

                    {!showResendButton && (
                      <View className="mt-3 flex-row justify-end w-full">
                        <Text className="text-sm font-SpaceGrotesk-Regular mr-1">Resend code in</Text>
                        <Text className="text-sm font-SpaceGrotesk-Regular text-secondary">{formatTime(timer)}</Text>
                      </View>
                    )}
                  </View>
            </View>
                
        </ScrollView>

    <View className='px-6 mt-3 mb-4'>
        {showResendButton ? (
          <CustomButton
            title={loading ? 'Sending...' : 'Resend Code'}
            containerStyles="bg-secondary mb-2"
            textStyles="text-white"
            handlePress={handleResendCode}
            disabled={loading}
          />
        ) : null}
        
      <CustomButton
        title={loading ? 'Verifying...' : 'Verify'}
        containerStyles="bg-primary"
        textStyles="text-gray"
        handlePress={handleSubmit}
        disabled={loading}
      />
    </View>

    {loading && <Loading /> }
    <StatusBar style='dark' />
    <Toaster theme='dark' />
    </SafeAreaView>
  )
}

export default verify