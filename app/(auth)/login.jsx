import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect, } from 'react';
import { StatusBar } from 'expo-status-bar'
import { Link, router } from 'expo-router';
import { Toaster } from 'burnt/web';
import * as Burnt from 'burnt'
import axios from 'axios'

import PasswordField from '../../components/PasswordField';
import CustomButton from '../../components/CustomButton';
import FormField from '../../components/FormField';
import Loading from '../../components/Loading';
import {images} from '../../constants'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotPasswordValid, setIsForgotPasswordValid] = useState(false);
  const [forgottenPasswordEmail, setForgottenPasswordEmail] = useState('');
  const [forgottenPasswordError, setForgottenPasswordError] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetCodeField, setResetCodeField] = useState('');
  

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    let emailErrorMsg = '';
    let isEmailValid = true;

    

    if (form.email.length >= 1 && !emailRegex.test(form.email)) {
      emailErrorMsg = 'Invalid email format';
      isEmailValid = false;
    }
    setEmailError(emailErrorMsg);

    // Forgotten password validation
    if (forgottenPasswordEmail.length >= 1 && !emailRegex.test(forgottenPasswordEmail)) {
      setIsForgotPasswordValid(false);
      setForgottenPasswordError('Invalid email format')
    } else {
      setIsForgotPasswordValid(true);
      setForgottenPasswordError('')
    }

    // Password validation
    let passwordErrorMsg = '';
    let isPasswordValid = true;

    if (form.password.length > 0 && form.password.length < 8) {
      passwordErrorMsg = 'Password must be at least 8 characters';
      isPasswordValid = false;
    }
    setPasswordError(passwordErrorMsg);

    // Check if all fields are filled
    const areAllFieldsFilled = form.email.trim() !== '' && form.password.trim() !== '';
    const isFormComplete = areAllFieldsFilled && isEmailValid && isPasswordValid;

    setIsFormValid(isFormComplete);
  }, [form, forgottenPasswordEmail]);
 

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;


    await AsyncStorage.setItem('emailAddress', form.email);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}login`,
        {
          email: form.email,
          password: form.password,
        }
      );

      console.log("Here")
      
      console.log(response.data.status)
      if (response.data.status) { 
        // Save token to AsyncStorage
        await AsyncStorage.setItem('BearerToken', response.data.data.token);

        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
  
        // Store popular items
        await AsyncStorage.setItem('popular', JSON.stringify(response.data.data.popular));
  
        // Store vendors
        await AsyncStorage.setItem('vendors', JSON.stringify(response.data.data.vendors));

        //store laundries
        await AsyncStorage.setItem('laundries', JSON.stringify(response.data.data.laundries));
      
        await Burnt.toast({
          title: response.data.message,
          preset: 'success',
          from: 'top',
        });
      
        // Redirect to home after successful login
        router.replace('/home');
      }
    } catch (error) {
      let message = 'Unable to connect to the server';

      if (error.response) {
        const { status, data } = error.response;
      
        // Handle email not verified case
        if (status === 403 && data.message === 'Email not verified. Please verify your email to continue.') {
          await Burnt.toast({
            title: data.message,
            preset: 'error',
            from: 'top',
          });
          router.push('./verify');
          return;
        }

        // Handle validation errors
        message = data.message || message;
        if (data.data) {
          const errorMessages = Object.values(data.data).flat().join(', ');
          message = `${message}: ${errorMessages}`;
        }
      } else if (error.request) {
        message = 'Please check your internet connection';
      }

      await Burnt.toast({
        title: message,
        preset: 'error',
        from: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    console.log('resetPassword pressed')
    setModalLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}forgot-password`,
        { email: forgottenPasswordEmail }
      )
  
      if (response.data.status) {
        setResetCodeField(true)
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
      setModalLoading(false)
    }
  }

  const verifyResetCode = async () => {
    console.log('verifyResetCode pressed')
    setModalLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}verify-reset-code`,
        { email: forgottenPasswordEmail,
          reset_code: resetCode
         }
      )
    console.log(response.data.status)
      if (response.status === 200) {
        setIsModalVisible(false)
        setResetCodeField(false)
        setResetCode('')
        setForgottenPasswordEmail('')
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
      setModalLoading(false)
    }
  }

  return (
    <SafeAreaView className='h-full w-full bg-white'>
      <ScrollView className='h-[80vh] w-full'>
        <View className='flex-1 px-6 pt-12'>
          <View className='mb-2'>
            <Image source={images.logo} resizeMode='contain' style={{ height: 64, width: 64,}}/>
          </View>
          <Text className='font-Raleway-Bold text-primary text-4xl'>Welcome Back!</Text>
          <Text className='font-SpaceGrotesk-Medium text-lg'>Sign In to your account</Text>

          <View className='mt-10'>
            <FormField 
              title="Email Address"
              placeholder="user@example.com"
              error={emailError}
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mb-7"
              keyboardType="email-address"
              autoCapitalize={'none'}
            />

            <PasswordField 
              title="Password"
              placeholder="xxxxxxxx"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              error={passwordError}
              otherStyles="mb-4"
            />

            <TouchableOpacity className='flex-row justify-end mb-6' onPress={() => setIsModalVisible(true)}>
                <Text className='w-min-[30%] font-SpaceGrotesk-Regular text-[15px] text-secondary'>Forget Password</Text>
            </TouchableOpacity>

          </View>
        </View>
        
      </ScrollView>

      <View className='px-6 mt-2'>
          <CustomButton
            title={loading ? "Logging in to your Account..." : "Log in"}
            containerStyles="bg-primary"
            textStyles="text-gray"
            handlePress={handleSubmit}
            disabled={!isFormValid || loading}
          />
          <View className="mt-4 mb-8">
            <Text className=' text-sm font-SpaceGrotesk-Regular text-center text-dark'>Don't have an account?
            <Link href='./register' className=' text-secondary'> Register</Link>
            </Text>
          </View>
      </View>

      {isModalVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 justify-center items-center">

        <View className='bg-white rounded-lg w-[90%] p-5 py-10'>
          <Text className="font-SpaceGrotesk-Semibold text-primary text-2xl lh">Enter your Email Address</Text>
          <Text className="font-Raleway-Light  text-md mb-8">Your Password will be sent to your Email Address</Text>

          <FormField 
              title="Email Address"
              placeholder="user@example.com"
              error={forgottenPasswordError}
              value={forgottenPasswordEmail}
              handleChangeText={(e) => setForgottenPasswordEmail(e)}
              titleStyle="text-base"
              otherStyles="mb-7"
              keyboardType="email-address"
              autoCapitalize='none'
              editable={!resetCodeField}
            />

          {resetCodeField && (
            <PasswordField 
            title="Reset Code"
            value={resetCode}
            handleChangeText={(e) => setResetCode(e)}
            otherStyles="mb-7"
            keyboardType="numeric"
            autoCapitalize='none'
            maxLength={6}
            />
          )}



            <View className='flex flex-row gap-x-3'>
            <CustomButton
                title={
                  modalLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#ffffff" /> Loading
                    </>
                  ) : resetCodeField ? (
                    'Verify Reset Code'
                  ) : (
                    'Reset Password'
                  )
                }
                containerStyles="bg-primary px-4 flex-1"
                textStyles="text-white"
                disabled={(resetCodeField ? !(resetCodeField && resetCode.length === 6) : !isForgotPasswordValid) || modalLoading}
                handlePress={resetCodeField ? verifyResetCode : resetPassword}
              />


              <CustomButton 
              title='Close'
              containerStyles="border px-6 "
              handlePress={() => {
                setIsModalVisible(false)
                setResetCodeField(false)
                setResetCode('')
              }}
              />

            </View>

        </View>

              
                
        </View>
      )}

      
      {loading && <Loading /> }
      <Toaster />
      <StatusBar style='dark' />

    </SafeAreaView>
  )
}

export default Login