import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {TextField, Button} from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SignupForm({onSubmit}) {
  const {errors, control, handleSubmit} = useForm();

  return (
    <>
      <Controller
        name="displayName"
        control={control}
        defaultValue=""
        rules={{
          required: 'Display Name is required',
          maxLength: {value: 100, message: 'Max Length 100'},
        }}
        render={({onChange, value}) => {
          return (
            <TextField
              title="Display Name"
              value={value}
              onChangeText={text => onChange(text)}
              error={errors.displayName?.message}
            />
          );
        }}
      />
      <Controller
        name="email"
        control={control}
        defaultValue=""
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            message: 'Email not valid',
          },
        }}
        render={({onChange, value}) => {
          return (
            <TextField
              title="Email"
              value={value}
              onChangeText={text => onChange(text)}
              textContentType="emailAddress"
              error={errors.email?.message}
            />
          );
        }}
      />

      <Controller
        name="password"
        control={control}
        defaultValue=""
        rules={{
          required: 'Password is required',
          minLength: {value: 6, message: 'Password Length 6-25'},
          maxLength: {value: 25, message: 'Password Length 6-25'},
        }}
        render={({onChange, value}) => {
          return (
            <TextField
              title="Password"
              value={value}
              onChangeText={text => onChange(text)}
              secureTextEntry
              error={errors.password?.message}
            />
          );
        }}
      />
      <Button
        bg-green20
        marginT-10
        label="Sign Up"
        onPress={handleSubmit(onSubmit)}
        iconSource={() => (
          <Ionicons
            name="person-add-outline"
            size={20}
            color="white"
            style={{marginRight: 10}}
          />
        )}
      />
    </>
  );
}
