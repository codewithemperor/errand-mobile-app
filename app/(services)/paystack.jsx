import React from 'react';
import  { Paystack }  from 'react-native-paystack-webview';
import { View } from 'react-native';




export default function Pay() {
  return (
    <View style={{ flex: 1 }}>
      <Paystack  
        paystackKey="sk_live_67a7a1eddc2d3cb68cf18e416eb69bf7aa30b2b4"
        amount={'25000.00'}
        currency="NGN"
        channels={['card', 'bank', 'ussd', 'qr', 'mobile_money']}
        billingEmail="paystackwebview@something.com"
        activityIndicatorColor="green"
        onCancel={(e) => {
          console.log("Cancelled")
        }}
        onSuccess={(res) => {
          console.log("Success")
        }}
        autoStart={true}
      />
    </View>
  );
}