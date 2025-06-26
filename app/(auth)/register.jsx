import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Pressable} from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Link, router } from 'expo-router'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Burnt from 'burnt'
import { Toaster } from 'burnt/web'
import DateTimePicker from '@react-native-community/datetimepicker'


import { icons, images } from '../../constants'
import CustomButton from '../../components/CustomButton'
import FormField from '../../components/FormField'
import PasswordField from '../../components/PasswordField'


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

const Register = () => {
  const [loading, setLoading] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confPasswordError, setConfPasswordError] = useState('')
  
  const [form, setForm] = useState({
    fullname: '',
    phoneNumber: '',
    email: '',
    password: '',
    confPassword: '',
    dob: null
  })

  useEffect(() => {
    // Email validation
    const email = form.email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const hasUpperCase = /[A-Z]/.test(email)
    let emailErrorMsg = ''
    let isEmailValid = true

    if (email.length >= 1) {
      if (!emailRegex.test(email)) {
        emailErrorMsg = 'Invalid email format'
        isEmailValid = false
      } else if (hasUpperCase) {
        emailErrorMsg = 'Email should not contain uppercase letters'
        isEmailValid = false
      }
    }
    setEmailError(emailErrorMsg)

    // Password validation
    let passwordErrorMsg = ''
    let isPasswordValid = true
    if (form.password.length > 0 && form.password.length < 8) {
      passwordErrorMsg = 'Password must be at least 8 characters'
      isPasswordValid = false
    }
    setPasswordError(passwordErrorMsg)

    // Confirm password validation
    let confPasswordErrorMsg = ''
    let isConfPasswordValid = true
    if (form.confPassword.length > 0 && form.confPassword !== form.password) {
      confPasswordErrorMsg = 'Passwords do not match'
      isConfPasswordValid = false
    }
    setConfPasswordError(confPasswordErrorMsg)

    // Phone validation
    const isPhoneValid = form.phoneNumber.length === 10

    // Check all fields filled
    const areAllFieldsFilled = form.fullname.trim() !== '' &&
                              form.phoneNumber.trim() !== '' &&
                              form.email.trim() !== '' &&
                              form.password.trim() !== '' &&
                              form.confPassword.trim() !== '' &&
                              form.dob !== null

    const isFormComplete = areAllFieldsFilled &&
                          isPhoneValid &&
                          isEmailValid &&
                          isPasswordValid &&
                          isConfPasswordValid

    setIsFormValid(isFormComplete)
  }, [form])

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setForm({ ...form, dob: selectedDate.toISOString().split('T')[0] })
    }
  }

  const formatDOB = (dateString) => {
    return dateString || ''
  }

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;

    await AsyncStorage.setItem('emailAddress', form.email);

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}register`,
        {
          fullname: form.fullname,
          phone: form.phoneNumber,
          email: form.email,
          password: form.password,
          password_confirmation: form.confPassword,
          dob: form.dob
        }
      );

      if (response.data.status) { 
        await Burnt.toast({
          title: response.data.message,
          preset: 'success',
          from: 'top',
        });
        router.push('./verify');
      }
    } catch (error) {
      let message = 'Unable to connect to the server';
      let isEmailTaken = false;

      if (error.response) {
        const apiError = error.response.data;
        message = apiError.message || message;

        // Handle validation errors
        if (apiError.data) {
          const errorMessages = Object.values(apiError.data)
            .flat()
            .join(', ');
        
          // Check if any error message contains email taken error
          isEmailTaken = errorMessages.includes('The email has already been taken.');
          message = `${message}: ${errorMessages}`;
        }
      } else if (error.request) {
        message = 'Please check your internet connection';
      }

      // Show toast first
      await Burnt.toast({
        title: message,
        preset: 'error',
        from: 'top',
      });

      // Then navigate if email is taken
      if (isEmailTaken) {
        router.push('./login');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className='h-full w-full bg-white'>
      <ScrollView className='h-[80vh] w-full'>
        <View className='flex-1 px-6 pt-12'>
          <View className='mb-2'>
            <Image source={images.logo} resizeMode='contain' style={{ height: 64, width: 64,}} />
          </View>
          <Text className='font-Raleway-Bold text-primary text-4xl'>Create Account!</Text>
          <Text className='font-SpaceGrotesk-Medium text-lg'>Sign Up to get started</Text>

          <View className='my-10'>
            <FormField 
              title="Full Name"
              placeholder="Adekunle Ibrahim Nneka"
              value={form.fullname}
              handleChangeText={(e) => setForm({ ...form, fullname: e })}
              otherStyles="mb-7"
            />

            <FormField 
              title="Phone Number"
              placeholder="8000000000"
              value={form.phoneNumber}
              handleChangeText={(e) => setForm({ ...form, phoneNumber: e })}
              otherStyles="mb-7"
              keyboardType="numeric"
              maxLength={10}
            />

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

            <Pressable onPress={() => setShowDatePicker(true)} className='mb-7'>
              <View pointerEvents="none">
                <FormField
                  title="Date of Birth"
                  placeholder="YYYY/MM/DD"
                  value={formatDOB(form.dob)}
                  editable={false}
                  icon={icons.CalendarIcon}
                  height={10}
                  width={10}
                  color="gray"
                />
              </View>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={form.dob ? new Date(form.dob) : new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            )}

            <PasswordField 
              title="Password"
              placeholder="xxxxxxxx"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              error={passwordError}
              otherStyles="mb-7"
            />

            <PasswordField 
              title="Confirm Password"
              placeholder="xxxxxxxx"
              value={form.confPassword}
              handleChangeText={(e) => setForm({ ...form, confPassword: e })}
              error={confPasswordError}
            />
          </View>
        </View>
      </ScrollView>

      <View className='px-6 mt-3'>
        <CustomButton
          title={loading ? "Creating Account..." : "Create Account"}
          containerStyles="bg-primary"
          textStyles="text-gray"
          handlePress={handleSubmit}
          disabled={!isFormValid || loading}
        />
        <View className="mt-2 mb-4">
          <Text className='text-sm font-SpaceGrotesk-Regular text-center text-dark'>
            Already have an account?
            <Link href='./login' className='text-secondary'> Login</Link>
          </Text>
        </View>
      </View>

      {loading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 justify-center items-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <StatusBar style='dark' />
      <Toaster />
    </SafeAreaView>
  )
}

export default Register